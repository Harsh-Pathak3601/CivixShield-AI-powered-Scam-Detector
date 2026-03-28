import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    let pk = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    console.log('[Firebase Admin] Attempting init:')
    console.log('  projectId:', projectId || 'MISSING')
    console.log('  clientEmail:', clientEmail || 'MISSING')
    console.log('  privateKey present:', !!pk && pk.length > 10)

    if (pk && pk.length > 10 && projectId && projectId.length > 1 && clientEmail && clientEmail.length > 1) {
      // Strip surrounding quotes that some .env parsers add
      pk = pk.replace(/^"|"$/g, '');
      // Convert escaped \n to real newlines
      const formattedKey = pk.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: formattedKey,
        }),
        // databaseURL is optional but helps with some regions
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
      })
      console.log('[Firebase Admin] ✅ Initialized successfully with project:', projectId)
    } else {
      console.warn('[Firebase Admin] ⚠️ Falling back to dummy - credentials missing or empty')
      admin.initializeApp({ projectId: 'dummy-project-id' })
    }
  } catch (error: any) {
    console.error('[Firebase Admin] ❌ FATAL init error:', error.message)
  }
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export { admin }
