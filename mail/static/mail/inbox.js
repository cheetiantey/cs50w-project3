document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  console.log("This is a test")

  document.querySelector('#compose-submit').onclick = () => {
    console.log("This is a second test")
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result)
      console.log("This is a third test")
      load_mailbox('inbox')

    });
  }

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/inbox')
  .then(response => response.json())
  .then(email => {
    console.log(email)
    email.forEach(email => {
      // Email is unread - make background color white; Email is read - make background color red
      if (email.read === false) {
        const div = document.createElement('div');
        div.style.backgroundColor = 'white';
        div.innerHTML = `<h4>Sender: ${email.sender}</h4>`;
        div.innerHTML += `<h6>Subject line: ${email.subject}</h6>`;
        div.innerHTML += `<h6>Timestamp: ${email.timestamp}</h6>`;
        document.querySelector('#emails-view').append(div);
      } else {
        const div = document.createElement('div');
        div.style.backgroundColor = 'red';
        div.innerHTML = `<h4>Sender: ${email.sender}</h4>`;
        div.innerHTML += `<h6>Subject line: ${email.subject}</h6>`;
        div.innerHTML += `<h6>Timestamp: ${email.timestamp}</h6>`;
        document.querySelector('#emails-view').append(div);
      }
      
    });
  });
}