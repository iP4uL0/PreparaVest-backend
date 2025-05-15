CREATE TYPE funcao_usuario AS ENUM ('aluno', 'professor');	
CREATE TYPE S_usuario AS ENUM ('0', '1');
CREATE TYPE s_pergunta AS ENUM ('0', '1');

CREATE TABLE usuarios (
	id_usuario SERIAL PRIMARY KEY,
	email VARCHAR(50) UNIQUE,
	senha VARCHAR(100),
	funcao funcao_usuario NOT NULL,
	status S_usuario NOT NULL
);

select * from usuarios


CREATE TABLE perguntas(
	id_pergunta SERIAL PRIMARY KEY,
	enunciado VARCHAR(200) UNIQUE,
	alternativa_a VARCHAR(100) NOT NULL,
	alternativa_b VARCHAR(100) NOT NULL,
	alternativa_c VARCHAR(100) NOT NULL,
	alternativa_d VARCHAR(100) NOT NULL,
	correta VARCHAR(20) NOT NULL CHECK (
        correta IN ('alternativa_a', 'alternativa_b', 'alternativa_c', 'alternativa_d')
		),
	status s_pergunta NOT NULL
);

select * from perguntas
