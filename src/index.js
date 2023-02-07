import { PrismaClient } from '@prisma/client'
import path from 'path';
import process from 'process'
import express from 'express';
import nunjucks from 'nunjucks'
import bodyParser from 'body-parser'
import basicAuth from 'express-basic-auth'

const router = express.Router()
// import { loggingMiddleware, authMiddleware } from './middleware'
const app = express();
const __dirname = path.dirname(process.cwd());

console.log(__dirname)

const myBasicAuth = basicAuth({
  challenge: true,
  users: { 'admin': 'admin' }
})

app.use('/api', myBasicAuth)

app.use(bodyParser.urlencoded({ extended: true }));


nunjucks.configure(`${__dirname}/eventos-academicos/src/views`, {
  autoescape: true,
  express: app
});

router.get('/', async (req, res) => {
  const search = req.query.search ?? ''
  const eventos = await prisma.evento.findMany({
    where: {
      nome: {
        contains: search
      }
    }
  })
  res.render('index.html', { eventos });
});

router.get('/cadastrar/evento', myBasicAuth, (req, res) => {
  res.render('cadastrar-evento.html', { edit: true });
});

router.post('/cadastrar/evento', myBasicAuth, async (req, res) => {
  const body = req.body;

  if (body.eventoId) {
    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(body.eventoId) }
    })
    await prisma.palestrante.create({
      data: {
        nome: body.nomePalestrante,
        telefone: body.telefonePalestrante,
        email: body.emailPalestrante,
        minicurriculo: body.resumoPalestrante,
        urlSite: body.sitePalestrante,
        linkLattes: body.linkLattesPalestrante,
        linkRedeSocial: body.linkRedeSocialPalestrante,
        eventoId: parseInt(body.eventoId)
      }
    })
    const step = parseInt(body.step) + 1
    res.render('cadastrar-palestrante.html', { evento, step, edit: true });
  }
  else {
    const evento = await prisma.evento.create({
      data: {
        nome: body.nomeEvento,
        descricao: body.descricaoEvento,
        dataHora: new Date(body.dataEvento),
        urlSite: body.siteEvento,
      }
    })
    res.render('cadastrar-palestrante.html', { evento, step: 2, edit: true });
  }
});

router.get('/editar/evento', myBasicAuth, async (req, res) => {
  const id = req.query.id
  if (!id) {
    const eventos = await prisma.evento.findMany()
    res.render('index.html', { eventos });
  }
  const evento = await prisma.evento.findUnique({
    where: { id: parseInt(id) }
  })
  const palestrantes = await prisma.palestrante.findMany({
    where: {
      eventoId: evento.id
    }
  })
  res.render('cadastrar-evento.html', { evento, palestrantes, edit: true });
});

router.get('/ver/evento', async (req, res) => {
  const id = req.query.id
  if (!id) {
    const eventos = await prisma.evento.findMany()
    res.render('index.html', { eventos });
  }
  const evento = await prisma.evento.findUnique({
    where: { id: parseInt(id) }
  })
  const palestrantes = await prisma.palestrante.findMany({
    where: {
      eventoId: evento.id
    }
  })
  res.render('cadastrar-evento.html', { evento, palestrantes, edit: false });
});

router.post('/ver/evento', myBasicAuth, async (req, res) => {
  const body = req.body;
  const action = body.action ?? ''
  const id = req.query.id
  let successMessage = ''
  if (action === 'cadastraOuvinte') {
    await prisma.ouvinte.create({
      data: {
        eventoId: parseInt(body.eventoId),
        nome: body.nomeOuvinte,
        telefone: body.nomeOuvinte,
        email: body.emailOuvinte
      }
    })

    successMessage = 'Inscrição realizada com sucesso'
  }

  const evento = await prisma.evento.findUnique({
    where: { id: parseInt(id) }
  })
  res.render('cadastrar-evento.html', { evento, successMessage });
})

router.get('/cadastrar/palestrante', myBasicAuth, (req, res) => {
  res.render('cadastrarpalestrante.html');
});

router.post('/cadastrar/palestrante', myBasicAuth, (req, res) => {
  console.log(req)
  res.render('cadastrar-palestrante.html');
});

router.get('/api/eventos', async (req, res) => {
  const search = req.query.search ?? ''
  const eventos = await prisma.evento.findMany({
    where: {
      nome: {
        contains: search
      }
    }
  })

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(eventos));
})

router.get('/api/palestrantes', async (req, res) => {
  const evento = req.query.eventoId ?? null
  const search = req.query.search ?? null
  let where = {}

  if (evento !== null) {
    where.eventoId = {
      equals: parseInt(evento)
    }
  }
  if (search !== null) {
    where.nome = {
      contains: search
    }
  }
  const palestrantes = await prisma.palestrante.findMany({
    where
  })

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(palestrantes));
})

router.get('/api/ouvintes', async (req, res) => {
  const evento = req.query.eventoId ?? null
  const search = req.query.search ?? null
  let where = {}

  if (evento !== null) {
    where.eventoId = {
      equals: parseInt(evento)
    }
  }
  if (search !== null) {
    where.nome = {
      contains: search
    }
  }
  const ouvintes = await prisma.ouvinte.findMany({
    where
  })

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(ouvintes));
})

router.get('/editar/ver-evento', async (req, res) => {
  const id = req.query.id
  if (!id) {
    const eventos = await prisma.evento.findMany()
    res.render('index.html', { eventos });
  }
  const evento = await prisma.evento.findUnique({
    where: { id: parseInt(id) }
  })
  const palestrantes = await prisma.palestrante.findMany({
    where: {
      eventoId: evento.id
    }
  })
  res.render('cadastrar-evento.html', { evento, palestrantes, edit: false });
});

router.post('/editar/ver-evento', async (req, res) => {
  const id = req.query.id
  if (!id) {
    const eventos = await prisma.evento.findMany()
    res.render('index.html', { eventos });
  }
  const evento = await prisma.evento.findUnique({
    where: { id: parseInt(id) }
  })
  const palestrantes = await prisma.palestrante.findMany({
    where: {
      eventoId: evento.id
    }
  })
  res.render('cadastrar-evento.html', { evento, palestrantes, edit: false });
});

// app.use(loggingMiddleware)
app.use('/', router)

const prisma = new PrismaClient()

async function main() {
  app.listen(3000, () => console.log('Esse app esta rodando na porta 3000.'));
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
