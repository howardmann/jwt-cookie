let $form = document.querySelector('form')
let $main = document.querySelector('#main')
let $secret = document.querySelector('#secret')
let $logout = document.querySelector('#logout')
let $admin = document.querySelector('#admin')
let $profile = document.querySelector('#profile')

$form.addEventListener('submit', (e) => {
  e.preventDefault()
  
  let email = e.target.email.value
  let password = e.target.password.value

  axios.post('http://localhost:3000/auth/login', {email, password}, {
    withCredentials: true
  }).then(resp => {
    let msg = resp.data
    $main.innerHTML = msg.token
    console.log(resp.data);
  })
})

$secret.addEventListener('click', (e) => {
  axios.get('http://localhost:3000/api/secret', {withCredentials: true})
    .then(resp => {
      let result = resp.data
      $main.innerHTML = result.secret
    }).catch(err => {
      $main.innerHTML = 'Must login to find it'
    })
})

$admin.addEventListener('click', () => {
  axios.get('http://localhost:3000/api/users', {withCredentials: true})
    .then(resp => {
      let users = resp.data.map(el => {
        return `<li>${el.email}</li>`
      })
      $main.innerHTML = `<ul>${users}</li>`      
    })
    .catch(err => {
      $main.innerHTML = 'Admin only'
    })
})


$logout.addEventListener('click', () => {
  axios.get('http://localhost:3000/auth/logout', {withCredentials: true})  
    .then(resp => {
      $main.innerHTML = ''
    })
})

$profile.addEventListener('click', () => {
  axios.get('http://localhost:3000/api/profile', {withCredentials: true})
    .then(resp => {
      let user = resp.data
      $main.innerHTML = `
        <p>email: ${user.email}</p>
        <p>id: ${user.id}</p>,
      `
    })
    .catch(err => {
      $main.innerHTML = 'Must login to view'
    })
})