import styles from "./Loading.module.css";


const Loading = () => {
  return (
    <div className={styles.loading_container}>
        <div className={styles.spinner_custom}>Loading...</div>
    </div>
  );
};

export default Loading;