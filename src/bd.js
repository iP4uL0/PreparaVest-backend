import postgres from "postgres";

const sql = postgres("postgres://root:root@192.168.1.15:5432/Projeto_Quizz");

export default sql;
