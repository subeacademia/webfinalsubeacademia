const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Configuración de Firebase - usa las mismas credenciales de tu proyecto
const firebaseConfig = {
  // Aquí debes poner tu configuración de Firebase
  // Por seguridad, no la incluyo aquí, pero debes copiarla de tu environment
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetOldLeads() {
  try {
    console.log('🧹 Iniciando limpieza de leads antiguos...');
    
    // Obtener todos los documentos de la colección 'leads' (antigua)
    const leadsSnapshot = await getDocs(collection(db, 'leads'));
    const totalLeads = leadsSnapshot.size;
    
    console.log(`📊 Encontrados ${totalLeads} leads antiguos para eliminar`);
    
    if (totalLeads === 0) {
      console.log('✅ No hay leads antiguos que eliminar');
      return;
    }
    
    // Confirmar antes de eliminar
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question(`¿Estás seguro de que quieres eliminar ${totalLeads} leads antiguos? (y/N): `, resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operación cancelada');
      return;
    }
    
    // Eliminar todos los documentos
    let deletedCount = 0;
    const deletePromises = leadsSnapshot.docs.map(async (docSnapshot) => {
      try {
        await deleteDoc(doc(db, 'leads', docSnapshot.id));
        deletedCount++;
        console.log(`🗑️  Eliminado lead: ${docSnapshot.id}`);
      } catch (error) {
        console.error(`❌ Error eliminando lead ${docSnapshot.id}:`, error);
      }
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Limpieza completada: ${deletedCount} leads antiguos eliminados`);
    console.log('🎉 Los nuevos leads del diagnóstico actualizado se mostrarán cuando los usuarios completen el diagnóstico');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar el script
resetOldLeads().then(() => {
  console.log('🏁 Script completado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
