import express, { Router } from 'express'
import sql from './bd.js'
import { compararHash, Criarhash } from './utils.js';

const routes = express.Router()

//*busca de usuarios 
routes.post('/login',async (req, res)=>{
    const { email, senha } = req.body
    try{
        const consulta = await sql`select id_user,senha, funcao from usuarios
        where email = ${email} AND status = '1'`

        if(consulta.length == 0){
            return res.status(401).json('usuario não cadastrado')
        }

        const teste = await compararHash(senha, consulta[0].senha)

        if(teste){
            return res.status(200).json(consulta[0].funcao)
            
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
            return res.status(400).json({ mensagem : 'Email e senha são obrigatórios'})
        }

        const hash = await Criarhash(senha, 10)

        await sql`
            INSERT INTO usuarios(email, senha, funcao, status)
            VALUES (${email}, ${hash}, '1', '1' )
        `;

        return res.status(201).json({ mensagem: "Usuário criado com sucesso" });
    } catch (error) {
        if(error.code === '23502' || error.code === '23505'){
            return res.status(409).json({mensagem: 'Violation rule'})
        }
        else{
            return res.status(500).json({mensagem: 'Erro inesperado'})
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
        values(${email}, ${hash}, '2', '1')`

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
        const {enunciado, alt_a, alt_b, alt_c, alt_d, alt_e, correta} = req.body;

        if (
            !enunciado || enunciado === "" ||
            !alt_a || alt_a === "" ||
            !alt_b || alt_b === "" ||
            !alt_c || alt_c === "" ||
            !alt_d || alt_d === "" ||
            !alt_e || alt_e === "" ||
            !correta || correta === ""
        ) {
            return res.status(400).json('Todos os campos são obrigatórios')
        }

        await sql`insert into perguntas (enunciado, alt_a, alt_b, alt_c, alt_d, alt_e correta, status) values (
        ${enunciado}, 
        ${alt_a}, 
        ${alt_b}, 
        ${alt_c}, 
        ${alt_d}, 
        ${alt_e}, 
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

//*Busca perguntas cards
routes.get('/perguntas/cards',async (req, res)=>{
    try{
        const consulta = await sql`SELECT * FROM perguntas WHERE status = '1'`
        return res.status(201).json(consulta)
    }
    catch(error){
        return res.status(500).json('Ocorreu um erro inesperado')
    }
});

//*busca acertos e erros
routes.post('/acertos',async (req, res)=>{
    const { id_user } = req.body
    try{
        const consulta = await sql`SELECT * FROM get_acertos(${id_user})`
        return res.status(201).json(consulta)
    }
    catch(error){
        return res.status(500).json('Ocorreu um erro inesperado')
    }
})





//*Deletar pergunta
// const {id_pergunta} = req.params
routes.delete('/perguntas/:id_pergunta', async (req, res)=>{
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
routes.put('/perguntas/:id_pergunta', async (req, res) => {
    try {
        const { id_pergunta } = req.params;
        const { newEnunciado, alt_a, alt_b, alt_c, alt_d, alt_e, correta } = req.body;

        if (
            !newEnunciado || newEnunciado === "" ||
            !alt_a || alt_a === "" ||
            !alt_b || alt_b === "" ||
            !alt_c || alt_c === "" ||
            !alt_d || alt_d === "" ||
            !alt_e || alt_e === "" ||
            !correta || correta === ""
        ) {
            return res.status(400).json('Todos os campos são obrigatórios');
        }

        //Validação do ENUM
        const opcoesValidas = ['alt_a', 'alt_b', 'alt_c', 'alt_d', 'alt_e'];
        if (!opcoesValidas.includes(correta)) {
            return res.status(409).json('Valor inválido para o campo "correta". Use apenas alt_a, alt_b, alt_c, alt_d ou alt_e');
        }

        //Verificar se o enunciado já existe em outra pergunta
        const existente = await sql`
            SELECT id_pergunta FROM perguntas 
            WHERE enunciado = ${newEnunciado} 
            AND id_pergunta <> ${id_pergunta}
        `;
        if (existente.length > 0) {
            return res.status(409).json('Já existe uma pergunta com esse enunciado.');
        }

        await sql`
            UPDATE perguntas 
            SET enunciado = ${newEnunciado}, 
                alt_a = ${alt_a}, 
                alt_b = ${alt_b}, 
                alt_c = ${alt_c}, 
                alt_d = ${alt_d}, 
                alt_e = ${alt_e}, 
                correta = ${correta}
            WHERE id_pergunta = ${id_pergunta};
        `;

        return res.status(204).json('Ação efetuada');
    } catch (error) {
        return res.status(500).json('Erro inesperado');
    }
});


export default routes
