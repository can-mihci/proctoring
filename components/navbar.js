import styles from "../styles/Navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

function NavbarButton(props) {
  const router = useRouter();
  return (
    <Link className={`${styles.button} ${props.route === router.pathname ? styles.current : ""}`} href={props.route}>
      <div>{props.text}</div>
    </Link>
  );
}

export default function Navbar() {
  return (
    <div className={styles.container}>
      <NavbarButton route="/" text="Ana Sayfa" />
      <NavbarButton route="/instructors" text="Hocalar" />
      <NavbarButton route="/departments" text="ABD" />
      <NavbarButton route="/courses/list" text="Dersler" />
      <NavbarButton route="/courses/bulk" text="Ders Ekle" />
    </div>
  );
}
