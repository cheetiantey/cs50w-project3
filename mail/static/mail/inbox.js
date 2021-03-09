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
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  console.log("This is a test")

  document.querySelector('#compose-submit').onclick = () => {
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
      // alert("Success")
      load_mailbox('sent')
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
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === "inbox") {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(email => {
      console.log(email)
      email.forEach(email => {
        // alert("Alert is triggered");
        // Email is unread - make background color white; Email is read - make background color red
        if (email.read === false) {
          const div = document.createElement('div');
          div.style.backgroundColor = 'white';
          div.innerHTML = `<h4>Sender: ${email.sender}</h4>`;
          div.innerHTML += `<h6>Subject line: ${email.subject}</h6>`;
          div.innerHTML += `<h6>Timestamp: ${email.timestamp}</h6>`;
          document.querySelector('#emails-view').append(div);
          div.addEventListener('click', () => load_email(email.id));
        } else {
          const div = document.createElement('div');
          div.style.backgroundColor = 'red';
          div.innerHTML = `<h4>Sender: ${email.sender}</h4>`;
          div.innerHTML += `<h6>Subject line: ${email.subject}</h6>`;
          div.innerHTML += `<h6>Timestamp: ${email.timestamp}</h6>`;
          document.querySelector('#emails-view').append(div);
          div.addEventListener('click', () => load_email(email.id));
        }

      });
      
    });
  } else if (mailbox === "sent") {
    fetch('/emails/sent')
    .then(response => response.json())
    .then(email => {
      console.log(email);
      email.forEach(email => {        
        const div = document.createElement('div');
        div.innerHTML = `<h4>Sender: ${email.sender}</h4>`;
        div.innerHTML += `<h6>Subject line: ${email.subject}</h6>`;
        div.innerHTML += `<h6>Timestamp: ${email.timestamp}</h6>`;
        document.querySelector('#emails-view').append(div);
        div.addEventListener('click', () => load_email(email.id));
      })
    })
  } else if (mailbox === "archive") {
    fetch('/emails/archive')
    .then(response => response.json())
    .then(email => {
      console.log(email);
      email.forEach(email => {        
        const div = document.createElement('div');
        div.innerHTML = `<h4>Sender: ${email.sender}</h4>`;
        div.innerHTML += `<h6>Subject line: ${email.subject}</h6>`;
        div.innerHTML += `<h6>Timestamp: ${email.timestamp}</h6>`;
        document.querySelector('#emails-view').append(div);
        div.addEventListener('click', () => load_email(email.id));
      })
    })

  }

}

function load_email(email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  document.querySelector('#email-view').innerHTML = "";

  // Individual email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    // Content of email
    const div = document.createElement('div');
    div.innerHTML = `<h4><b>Sender:</b> ${email.sender}</h4>`;
    div.innerHTML += `<h6><b>Recipients:</b> ${email.recipients}</h6>`;
    div.innerHTML += `<h6><b>Subject line:</b> ${email.subject}</h6>`;
    div.innerHTML += `<h6><b>Body:</b> ${email.body}</h6>`;
    div.innerHTML += `<h6><b>Timestamp:</b> ${email.timestamp}</h6>`;
    document.querySelector('#email-view').append(div);

    // if the email is not archived, add a button to let the user archive it
    // else, add a button to let the user unarchive it
    if (email.archived === false) {
      const archive_button = document.createElement('button');
      archive_button.className = "btn btn-sm btn-outline-success";
      archive_button.innerHTML = "Archive this email";
      document.querySelector('#email-view').append(archive_button);

      archive_button.addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        .then(() => load_mailbox('inbox'));
      });
    } else {
      const archive_button = document.createElement('button');
      archive_button.className = "btn btn-sm btn-outline-danger";
      archive_button.innerHTML = "Unarchive this email";
      document.querySelector('#email-view').append(archive_button);

      archive_button.addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        .then(() => load_mailbox('inbox'));
      });      
    }

    // line break such that the archive button and 
    // reply button are on separate lines
    const line_break = document.createElement('div');
    line_break.innerHTML = "<br>";
    document.querySelector('#email-view').append(line_break);

    const reply_button = document.createElement('button');
    reply_button.className = "btn btn-sm btn-outline-secondary";
    reply_button.innerHTML = "Reply";
    document.querySelector('#email-view').append(reply_button);

    reply_button.addEventListener('click', () => {
      compose_email();

      document.querySelector("#compose-recipients").value = email.sender;
      if (email.subject.search("Re: ") === 0) {
        document.querySelector("#compose-subject").value = email.subject;
        document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      } else {
        document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
        document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;        
      }
    });
  })

  // Mark email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}