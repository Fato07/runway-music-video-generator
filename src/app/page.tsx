import Image from "next/image";
import styles from "./page.module.css";
import AudioUpload from "@/components/AudioUpload";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* <AudioUpload onFileSelect={}/> */}
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
</main>
    </div>
  );
}
