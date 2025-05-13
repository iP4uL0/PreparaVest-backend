import express, { Router } from 'express'
import sql from './bd.js'
import { compararHash, Criarhash } from './utils.js';


const routes = express.Router()

//busca de usuarios 
routes.post('/login',async (req, res)=>{
    const { usuario, senha } = req.body
    try{
        
        const consulta = await sql`select id, senha, status from usuarios
        where usuario = ${usuario}`

        if(consulta.length == 0){
            return res.status(409).json('usuario não cadastrado')
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
        console.log(error)
        return res.status(500).json('um erro inesperado ocorreu')
    }
})



//cadastro de alunos
routes.post('/usuario', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verifica se o email já existe
        const existingUser = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(409).json({ mensagem: "Email já cadastrado" });
        }

        const hash = await Criarhash(senha, 10);

        await sql`
            INSERT INTO usuarios(email, senha)
            VALUES (${email}, ${hash})
        `;

        return res.status(201).json({ mensagem: "Usuário criado com sucesso" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro inesperado no servidor" });
    }
})


//cadastro de Adiministradores
routes.post('/Admin', async (req, res)=>{
    
    
    try {
        const {usuarioA, senha} = req.body;

        const hash = await Criarhash(senha, 10)
        
        await sql`insert into usuarios(usuario, senha, status)
        values(${usuarioA},${hash},'adimim')`

        return res.status(201).json('ok')

    } catch(error){
        console.log(error)
        return res.status(500).json('algo deu errado')

    }

})


//cadastro perguntas
routes.post('/Cperguntas', async (req, res)=>{
    try{
        const {pergunta, a, b, c, d, resposta, dificuldade, correct_answer } = req.body;
    await sql`insert into perguntas (pergunta, a, b, c, d, resposta, dificuldade, correct_answer) values (${pergunta}, ${a}, ${b}, ${c}, ${d}, ${resposta}, ${dificuldade}, ${correct_answer});`
    return res.status(201).json('ok')
    }
    catch(error){
        return res.status(500).json('erro ao cadastrar pergunta')
    }
})


//Busca perguntas
routes.post('/Bperguntas',async (req, res)=>{

    try{
            const consulta = await sql`SELECT * FROM perguntas ORDER BY RANDOM() LIMIT 10`
            return res.status(201).json(consulta)
    }
    catch(error){
        console.log(error)
        return res.status(500).json('Ocorreu um erro inesperado')
    }
    
});


//Deletar pergunta
routes.delete('/Delete/:pergunta', async (req, res)=>{

    try{
        const {id} = req.params
        await sql`DELETE FROM perguntas WHERE id = ${id};`
        return res.status(204).json('Pergunta deletada')
    }
    catch(error){
        console.log(error)
        return res.status(500).json('ocorreu um erro')
    }
})

//Editar perguntas
routes.put('/editar', async (req, res)=>{
    try{
        const {id, updpergunta, a, b, c, d, dificuldade, resposta} = req.body
        await sql`update perguntas set pergunta = ${updpergunta}, 
        a = ${a}, 
        b = ${b}, 
        c = ${c}, 
        d = ${d}, 
        dificuldade = ${dificuldade}, 
        resposta = ${resposta}
        where id = ${id};`
  
        return res.status(204).json('Ação efetuada')
    }
    catch(error){
        console.log(error)
        
        if(error === 409){
            return res.status(409).json('Violação de regra do bd')
        }
        else{
            return res.status(500).json('Erro inesperado')

        }
    }
})


export default routes