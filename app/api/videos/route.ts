import { NextResponse } from 'next/server';

export async function GET() {
  const videos = [
    {
      id: "v0",
      title: "Digital Arrest Scam (ft. Nana Patekar) - Watch & Learn",
      description: "A crucial PSA about the 'Digital Arrest' scam, where scammers pose as law enforcement agencies over video calls. Learn how to identify and defeat their scripts.",
      videoUrl: "https://youtu.be/Ew4CVvTcoVI?si=59AiTu1lpuw-Cn4p"
    },
    {
      id: "v0_1",
      title: "Debit & Credit Card Fraud Awareness - Raho Cyber Safe",
      description: "Digital payments make life easier but pose threats if accounts are compromised. Learn how to secure your debit and credit cards against modern fraud techniques.",
      videoUrl: "https://youtu.be/UX2FC4d7liw?si=Zp17aOGzXTj-Oz5K"
    },
    {
      id: "v0_2",
      title: "UPI Fraud Awareness - Raho Cyber Safe",
      description: "Watch this video to know exactly what to do when someone asks you for your UPI PIN or Card PIN. Stay alert to stay safe against modern payment scams.",
      videoUrl: "https://youtu.be/-fhw2BuzuD0?si=aQg9PFjLZ4iZXgRX"
    },
    {
      id: "v0_3",
      title: "RBI Digital Arrest Warning - Handcuff Scam",
      description: "An official public interest message from the Reserve Bank of India (RBI). Learn how scammers fake 'Digital Arrests' using fake police setups to extort money.",
      videoUrl: "https://youtu.be/RQ46CJBe3NQ?si=e7AulTxIZ-L-7Hu3"
    },
    {
      id: "v0_4",
      title: "RBI Digital Arrest Warning - Interrogation Scam",
      description: "An official public interest message from the Reserve Bank of India (RBI). Learn how scammers fake 'Digital Arrests' using fake interrogation tactics to extort money.",
      videoUrl: "https://youtu.be/siyTZ6DaFeQ?si=csDOftEgLyqLYzoP"
    }
  ];

  return NextResponse.json(videos);
}
