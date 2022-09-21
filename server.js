const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const db= knex({
	client: 'pg',
	connection: {
	  host : 'localhost', //localhost
	  user : 'postgres', //add your user name for the database here
	  port: 5432, // add your port number here
	  password : 'test', //add your correct password in here
	  database : 'smart-brain' //add your database name you created here
	}
});

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

const app = express();
app.use(bodyParser.json());

const database = {
	users: [
		{
			id: '123',
			name: 'John',
			password: 'cookies',
			email: 'john@gmail.com',
			entries: 0,
			joined: new Date() 
		},
		{
			id: '124',
			name: 'Sally',
			password: 'bananas',
			email: 'sally@gmail.com',
			entries: 0,
			joined: new Date() 
		}
	],
	login: [
		{
			id:'987',
			hash:'',
			email:'john@gmail.com'
		}
	]
}

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!


app.get('/', (req, res)=> {
  res.send(database.users);
})

app.post('/signin', (req, res)=> {
	bcrypt.compare('apples','$2a$10$dOdiNN8mnxFKjm989GhuF.VrzbaxtT2/9rO2Y.UibwLw89.l5.Gb.', function (err, res) {
		console.log('first guess', res)
	});
	bcrypt.compare('veggies','$2a$10$dOdiNN8mnxFKjm989GhuF.VrzbaxtT2/9rO2Y.UibwLw89.l5.Gb.', function (err, res) {
		console.log('second guess', res)
	});
	if (req.body.email === database.users[0].email && 
		req.body.password === database.users[0].password) {
			res.json('success')
		}
	
else {
	res.status(404).json('error logging in');
}
})

app.post('/register', (req,res) => {
	const {email, name, password} = req.body;
	// bcrypt.hash(password, null, null, function(err, hash) {
	// 	console.log(hash);
	// });
	db('users')
	.returning('*')
	.insert({
		email: email,
		name:name,
		joined: new Date ()
	})
	.then(user => {
		res.json(user[0]);
	})
	.catch(err => res.status(400).json('unable to register'))	
})

app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
db.select('*').from('users').where({
	id: id
})
.then(user => {
	if(user.length) {
		res.json(user[0]);
	} else {
		res.status(400).json('not found');
	}
})
.catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
	const {id} = req.body;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id) {
			found = true;
			user.entries++
			return res.json(user.entries); 
		}
	})
	if (!found) {
		res.status(400).json('not found');
	}
})



// app.post('/signin', (req, res) => {
//   db.select('email', 'hash').from('login')
//     .where('email', '=', req.body.email)
//     .then(data => {
//       const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
//       if (isValid) {
//         return db.select('*').from('users')
//           .where('email', '=', req.body.email)
//           .then(user => {
//             res.json(user[0])
//           })
//           .catch(err => res.status(400).json('unable to get user'))
//       } else {
//         res.status(400).json('wrong credentials')
//       }
//     })
//     .catch(err => res.status(400).json('wrong credentials'))
// })

// app.post('/register', (req, res) => {
//   const { email, name, password } = req.body;
//   const hash = bcrypt.hashSync(password);
//     db.transaction(trx => {
//       trx.insert({
//         hash: hash,
//         email: email
//       })
//       .into('login')
//       .returning('email')
//       .then(loginEmail => {
//         return trx('users')
//           .returning('*')
//           .insert({
//             // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
//             // loginEmail[0] --> this used to return the email
//             // TO
//             // loginEmail[0].email --> this now returns the email
//             email: loginEmail[0].email,
//             name: name,
//             joined: new Date()
//           })
//           .then(user => {
//             res.json('user[0]');
//           })
//       })
//       .then(trx.commit)
//       .catch(trx.rollback)
//     })
//     .catch(err => res.status(400).json('unable to register'))
// })

// app.get('/profile/:id', (req, res) => {
//   const { id } = req.params;
//   db.select('*').from('users').where({id})
//     .then(user => {
//       if (user.length) {
//         res.json(user[0])
//       } else {
//         res.status(400).json('Not found')
//       }
//     })
//     .catch(err => res.status(400).json('error getting user'))
// })

// app.put('/image', (req, res) => {
//   const { id } = req.body;
//   db('users').where('id', '=', id)
//   .increment('entries', 1)
//   .returning('entries')
//   .then(entries => {
//     // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
//     // entries[0] --> this used to return the entries
//     // TO
//     // entries[0].entries --> this now returns the entries
//     res.json(entries[0].entries);
//   })
//   .catch(err => res.status(400).json('unable to get entries'))
// })

app.listen(3000, ()=> {
  console.log('app is running on port 3000');
})
