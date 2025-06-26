Ok I have now implemented the ability to send mails in return but I want them to be sent as actual replies like they are in gmail when you press reply. I have done this feature for my python app previously with reply drafts but I now want to do it in the typesript app as well. What is the difference between a normal message as it is right now and a proper reply and how do you code it?

Here is an article that helped others with this problem:

Ok this was the content of the website:

How To Send A Reply With Gmail API
Asked 9 years, 9 months ago
Modified 4 years, 10 months ago
Viewed 28k times
13

I have two gmail accounts I created a thread consisting of five messages and retreived them with gmail gapi at this page https://developers.google.com/gmail/api/v1/reference/users/threads/get.

This is what I got:

enter image description here

As you can see, the ids don't match, although they identify the exact same letters. Why this happens, and how can i get the unified id?

P.S. The real reason I am doing this is that I need to send a reply to a message with gmail API, but to do that, you need to know the id of the message that you reply to. And if I reply to the message with id that I have ( not the message id that the receiver has ), it just sends a 'new' message.

How can I send replies with Gmail API?

Thank you in advance.

    javascriptgmailgmail-apigoogle-api-js-client

Share
Improve this question
Follow
asked Sep 15, 2015 at 15:05
Vlas Bashynskyi's user avatar
Vlas Bashynskyi
2,02322 gold badges1717 silver badges2828 bronze badges

    Do you want to respond to a single message or respond to the thread? – 
    Tholle
    Commented Sep 15, 2015 at 15:48
    I want to respond to a single message. – 
    Vlas Bashynskyi
    Commented Sep 15, 2015 at 15:52

Add a comment
2 Answers
Sorted by:
46

As the docs say, if you're trying to send a reply and want the email to thread, make sure that:

    The Subject headers match
    The References and In-Reply-To headers follow the RFC 2822 standard.

If you want to do this yourself, you could get the Subject, References and Message-ID-headers of the message you want to respond to:

Request:

userId = me
id = 14fd1c555a1352b7 // id of the message I want to respond to.
format = metadata
metadataHeaders = Subject,References,Message-ID

GET https://www.googleapis.com/gmail/v1/users/me/messages/14fd1c555a1352b7?format=metadata&metadataHeaders=Subject&metadataHeaders=References&metadataHeaders=Message-ID

Response:

{
 "id": "14fd1c555a1352b7",
 "threadId": "14fd1c52911f0f64",
 "labelIds": [
  "SENT",
  "INBOX",
  "IMPORTANT",
  "UNREAD"
 ],
 "snippet": "Next level dude 2015-09-15 18:10 GMT+02:00 Emil Tholin &lt;emtholin@gmail.com&gt;: wow 2015-09-15 18:",
 "historyId": "575289",
 "internalDate": "1442333414000",
 "payload": {
  "mimeType": "multipart/alternative",
  "headers": [
   {
    "name": "In-Reply-To",
    "value": "<CADsZLRyzVPLRQuTthGSHKMCXL7Ora1jNW7h0jvoNgR+hU59BYg@mail.gmail.com>"
   },
   {
    "name": "References",
    "value": "<CADsZLRxZDUGn4Frx80qe2_bE5H5bQhgcqGk=GwFN9gs7Z_8oZw@mail.gmail.com> <CADsZLRyzVPLRQuTthGSHKMCXL7Ora1jNW7h0jvoNgR+hU59BYg@mail.gmail.com>"
   },
   {
    "name": "Message-ID", // This is the same for both users, as you were asking about.
    "value": "<CADsZLRwQWzLB-uq4_4G2E64NX9G6grn0cEeO0L=avY7ajzuAFg@mail.gmail.com>"
   },
   {
    "name": "Subject",
    "value": "Re: Cool"
   }
  ]
 },
 "sizeEstimate": 1890
}

To follow the RFC 2822 standard we have added the Message-ID of the message we want to respond to to the References-header, separated with a space. The In-Reply-To-header also has the value of message we want to respond to. We also add Re: to our Subject-header to indicate that it is a response.

// Base64-encode the mail and make it URL-safe 
// (replace "+" with "-", replace "/" with "_", remove trailing "=")
var encodedResponse = btoa(
  "Content-Type: text/plain; charset=\"UTF-8\"\n" +
  "MIME-Version: 1.0\n" +
  "Content-Transfer-Encoding: 7bit\n" +
  "References: <CADsZLRxZDUGn4Frx80qe2_bE5H5bQhgcqGk=GwFN9gs7Z_8oZw@mail.gmail.com> <CADsZLRyzVPLRQuTthGSHKMCXL7Ora1jNW7h0jvoNgR+hU59BYg@mail.gmail.com> <CADsZLRwQWzLB-uq4_4G2E64NX9G6grn0cEeO0L=avY7ajzuAFg@mail.gmail.com>\n" +
  "In-Reply-To: <CADsZLRwQWzLB-uq4_4G2E64NX9G6grn0cEeO0L=avY7ajzuAFg@mail.gmail.com>\n" +
  "Subject: Re:Cool\n" +
  "From: sender@gmail.com\n" +
  "To: reciever@gmail.com\n\n" +

  "This is where the response text will go"
).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

$.ajax({
  url: "https://www.googleapis.com/gmail/v1/users/me/messages/send?access_token=<USER_ACCESS_TOKEN>",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify({
    raw: encodedResponse
  })
});

As you can see, this is a pain in the backside to to manually. You could also just respond to the thread. This might not be enough for your use case however.

This way, you just have to supply the mail and the threadId, and make sure the Subject is the same, and Google will display it for you correctly.

// Base64-encode the mail and make it URL-safe 
// (replace "+" with "-", replace "/" with "_", remove trailing "=")
var encodedResponse = btoa(
  "Content-Type: text/plain; charset=\"UTF-8\"\n" +
  "MIME-Version: 1.0\n" +
  "Content-Transfer-Encoding: 7bit\n" +
  "Subject: Subject of the original mail\n" +
  "From: sender@gmail.com\n" +
  "To: reciever@gmail.com\n\n" +

  "This is where the response text will go"
).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

$.ajax({
  url: "https://www.googleapis.com/gmail/v1/users/me/messages/send?access_token=<USER_ACCESS_TOKEN>",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify({           
    raw: encodedResponse,
    threadId: "<THREAD_ID_OF_MESSAGE_TO_RESPOND_TO>"
  })
});

Share
Improve this answer
Follow
edited Jun 15, 2018 at 8:46
answered Sep 15, 2015 at 16:56
Tholle's user avatar
Tholle
113k2222 gold badges209209 silver badges198198 bronze badges

    1
    I tried the first solution given by you, but I am receiving 2 mails. One as a part of the mail thread and other is new. Second method fails with error "Invalid parameter". I am trying to add the draft to the thread, so far with no success. Google API documentation seems incorrect too. – 
    vikramaditya234
    Commented Feb 11, 2016 at 1:11
    1
    @vikramaditya234 You could try this. – 
    Tholle
    Commented Feb 11, 2016 at 1:28
    what happens if my existing message that I want to reply to don't have the headers References/In-Reply-To ? stackoverflow.com/questions/44880439/… – 
    Tal Avissar
    Commented Jul 3, 2017 at 8:06 

    Thank you for a great explanation and reference, it really helped me. Unfortunately first method is not working - i'm receiving separate email. However, once I added threadId as you suggesting in your second solution, I got email chain! – 
    Andrey Tagaew
    Commented Jul 26, 2019 at 6:25
    @Tholle the workaround of passing 'ThreadID' in message object is not working anymore and the messages are not threaded. Is it because of new threading changes introduced by Google – 
    zee
    Commented Sep 5, 2019 at 11:05

Show 3 more comments
6

The answer of @Tholle (thanks!) was correct and put me on the right track, but after the recent changes:

https://gsuiteupdates.googleblog.com/2019/03/threading-changes-in-gmail-conversation-view.html

I had to conflate his two paths.

In my program I had to reply to a thread, but if I included only the threadId (as #2) the new message is put in thread by Gmail only in the mail of the replier, while in the mail of the original sender (also gmail) is appeared as a new thread.

I resolved by including both the threadId and the headers "References" and "In-Reply-To" with the id of the last message.
Share
Improve this answer
Follow
answered Jul 31, 2020 at 6:09
Gabriele Alfredo Pini's user avatar
Gabriele Alfredo Pini
10111 silver badge33 bronze badges

    1
    Wow I managed to not realized this for 5.5 years! I turned off conversation view many many years ago probably because of this ambiguity. – 
    Simon_Weaver
    Commented Dec 31, 2024 at 2:37

