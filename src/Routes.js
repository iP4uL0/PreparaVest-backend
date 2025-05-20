import express, { Router } from 'express'
import sql from './bd.js'
import { compararHash, Criarhash } from './utils.js';

const routes = express.Router()

//*busca de usuarios 
routes.post('/login',async (req, res)=>{
    const { email, senha } = req.body
    try{
        const consulta = await sql`select id_usuario, senha, funcao, status from usuarios
        where email = ${email} AND status = '1'`

        if(consulta.length == 0){
            return res.status(401).json('usuario não cadastrado')
        }

        const teste = await compararHash(senha, consulta[0].senha)

        if(teste){
            return res.status(201).json('logado')
        }
        else{
            return res.status(401).json('usuario ou senha incorretos')
        }
    }
    catch(error){
        return res.status(500).json('um erro inesperado ocorreu')
    }
})


//*cadastro de alunos
routes.post('/usuario', async (req, res) => {
    try {
        const {email, senha} = req.body;

        if (!email || email.trim() === "" || !senha || senha.trim() === "") {
            return res.status(400).json('Email e senha são obrigatórios')
        }

        const hash = await Criarhash(senha, 10)

        await sql`
            INSERT INTO usuarios(email, senha, funcao, status)
            VALUES (${email}, ${hash}, 'aluno', '1' )
        `;

        return res.status(201).json({ mensagem: "Usuário criado com sucesso" });
    } catch (error) {
        if(error.code === '23502' || error.code === '23505'){
            return res.status(409).json('Violation rule')
        }
        else{
            return res.status(500).json('Erro inesperado')
        }
    }
})


//*cadastro de Adiministradores
routes.post('/usuario/admin', async (req, res)=>{
    try {
        const {email, senha} = req.body;

        if (!email || email.trim() === "" || !senha || senha.trim() === "") {
            return res.status(400).json('Email e senha são obrigatórios')
        }

        const hash = await Criarhash(senha, 10)
        
        await sql`insert into usuarios(email, senha, funcao, status)
        values(${email}, ${hash}, 'professor', '1')`

        return res.status(201).json('ok')

    } catch(error){
        if(error.code === '23502' || error.code === '23505'){
            return res.status(409).json('Violação de regra do bd')
        }
        else{
            return res.status(500).json('Erro inesperado')
        }
    }
})


//*cadastro perguntas
routes.post('/perguntas', async (req, res)=>{
    try{
        const {enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta} = req.body;

        if (
            !enunciado || enunciado === "" ||
            !alternativa_a || alternativa_a === "" ||
            !alternativa_b || alternativa_b === "" ||
            !alternativa_c || alternativa_c === "" ||
            !alternativa_d || alternativa_d === "" ||
            !correta || correta === ""
        ) {
            return res.status(400).json('Todos os campos são obrigatórios')
        }

        await sql`insert into perguntas (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, status) values (
        ${enunciado}, 
        ${alternativa_a}, 
        ${alternativa_b}, 
        ${alternativa_c}, 
        ${alternativa_d}, 
        ${correta}, 
        '1');`
        return res.status(201).json('ok')
    }
    catch(error){
        if(error.code === '23502' || error.code === '23505'){
            return res.status(409).json('Violação de regra do bd')
        }
        else{
            return res.status(500).json('Erro inesperado')
        }
    }
})


//*Busca perguntas
routes.get('/perguntas',async (req, res)=>{
    try{
        const consulta = await sql`SELECT * FROM perguntas WHERE status = '1' ORDER BY RANDOM() LIMIT 10`
        return res.status(201).json(consulta)
    }
    catch(error){
        return res.status(500).json('Ocorreu um erro inesperado')
    }
});


//*Deletar pergunta
routes.delete('/Delete/:id_pergunta', async (req, res)=>{
    try{
        const {id_pergunta} = req.params
      
        await sql`DELETE FROM perguntas WHERE id_pergunta = ${id_pergunta};`
        return res.status(204).json('Pergunta deletada')
    }
    catch(error){
        return res.status(500).json('ocorreu um erro')
    }
})


//*Editar perguntas
routes.put('/editar', async (req, res)=>{
    try{
        const {id_pergunta, newEnunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta} = req.body

        if (
            !newEnunciado || newEnunciado === "" ||
            !alternativa_a || alternativa_a === "" ||
            !alternativa_b || alternativa_b === "" ||
            !alternativa_c || alternativa_c === "" ||
            !alternativa_d || alternativa_d === "" ||
            !correta || correta === ""
        ) {
            return res.status(400).json('Todos os campos são obrigatórios')
        }

        await sql`update perguntas set enunciado = ${newEnunciado}, 
        alternativa_a = ${alternativa_a}, 
        alternativa_b = ${alternativa_b}, 
        alternativa_c = ${alternativa_c}, 
        alternativa_d = ${alternativa_d},  
        correta = ${correta}
        where id_pergunta = ${id_pergunta};`
  
        return res.status(204).json('Ação efetuada')
    }
    catch(error){
        if(error.code === '23502' || error.code === '23505'){
            return res.status(409).json('Violação de regra do bd')
        }
        else{
            return res.status(500).json('Erro inesperado')
        }
    }
})


export default routes
