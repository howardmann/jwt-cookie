let User = module.exports = {}

// In-memory implementation of DB
// hashed password using bcrypt.hashSync('chicken', 16)
const USERS = [
  {
    id: 1,
    email: 'howie@email.com',
    passwordHash: '$2b$10$zatp9gB2rkB6Q7N9p/21QusfFR7iIAzHXa/lfkHhDGM4EPC6yUGke',
    admin: true
  },
  {
    id: 2,
    email: 'felix@email.com',
    passwordHash: '$2b$10$/Ftv0MxQuu1DMscyr10iB.4qg.XgpfLVj1O9xhLZmcPFN19P7tLWS'
  }
]

User.findBy = (key, value) => {
  return USERS.filter(user => user[key] === value)[0]
}

User.list = () => {
  return USERS
}

User.create = ({email, passwordHash, admin}) => {
  let user = {
    id: Math.random(),
    email, 
    passwordHash, 
    admin: admin || false
  }
  USERS.push(user)
  return User.list()
}
