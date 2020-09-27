var currentUserKey = "";
var chatKey = "";
//////////////////////////////
document.addEventListener("keydown", function (key) {
  if (key.which === 13) {
    sendMessage();
  }
});
/////////////////////////////////////
function startChat(friendKey, friendName, friendPhoto) {
  var friendList = {
    friendId: friendKey,
    userId: currentUserKey,
  };
  var db = firebase.database().ref("friend_list");
  var flag = false;
  db.on("value", function (friends) {
    friends.forEach(function (data) {
      var user = data.val();
      if (
        (user.friendId === friendList.friendId &&
          user.userId === friendList.userId) ||
        (user.friendId === friendList.userId &&
          user.userId === friendList.friendId)
      ) {
        flag = true;
        chatKey = data.key;
      }
    });
    if (flag === false) {
      chatKey = firebase
        .database()
        .ref("friend_list")
        .push(friendList, function (error) {
          if (error) {
            alert(error);
          } else {
            document.getElementById("chatPanel").classList.remove("hide");
            document.getElementById("divStart").classList.add("hide");
            hideChatList();
          }
        })
        .getKey();
    } else {
      document.getElementById("chatPanel").classList.remove("hide");
      document.getElementById("divStart").classList.add("hide");
      hideChatList();
    }
    ///////////////////////////////////
    //dispaly friend naem and photo
    document.getElementById("divChatName").innerHTML = friendName;
    document.getElementById("imgChat").src = friendPhoto;
    document.getElementById("messages").innerHTML = "";
    //////////////////////////////////////////
    // display chat messages
    loadChatMessages(chatKey, friendPhoto);
  });
}
// display chat messages
function loadChatMessages(chatKey, friendPhoto) {
  var db = firebase.database().ref("chatMessage").child(chatKey);
  db.on("value", function (chats) {
    var messageDisplay = "";
    chats.forEach(function (data) {
      var chat = data.val();
      var dateTime = chat.dateTime.split(",");
      var msg = "";
      if (chat.msgType === "image") {
        msg = `<img src = "${chat.msg}" class="img-fluid" />`;
      } else {
        msg = chat.msg;
      }
      if (chat.userId !== currentUserKey) {
        messageDisplay += `<div class="row">
                                    <div class="col-2 col-sm-1 col-md-1">
                                        <img class="chatPic rounded-circle" src="${friendPhoto}" alt="">
                                    </div>
                                    <div class="col-5 col-sm-7 col-md-7">
                                        <p class="recive">
                                           ${msg}
                                           <span class="time float-right" title = "${dateTime[0]}">${dateTime[1]}</span>
                                        </p>
                                    </div>
                                  </div>`;
      } else {
        messageDisplay += `<div class="row justify-content-end">
                                    <div class="col-6 col-sm-7 col-md-7 ">
                                        <p class="send float-right">
                                            ${msg}
                                            <span class="time float-right" title = "${
                                              dateTime[0]
                                            }">${dateTime[1]}</span>
                                        </p>
                                    </div>
                                    <div class="col-2 col-sm-1 col-md-1">
                                         <img class="chatPic rounded-circle" src="${
                                           firebase.auth().currentUser.photoURL
                                         }" alt="">
                                    </div>
                                  </div>`;
      }
    });
    document.getElementById("");
    document.getElementById("messages").innerHTML = messageDisplay;
    document
      .getElementById("messages")
      .scrollTo(0, document.getElementById("messages").scrollHeight);
  });
}

/////////////////////////////////

function showChatList() {
  document.getElementById("side1").classList.remove("d-md-block", "d-none");
  document.getElementById("side2").classList.add("hide");
}
function hideChatList() {
  document.getElementById("side1").classList.add("d-md-block", "d-none");
  document.getElementById("side2").classList.remove("hide");
}
///////////
function sendMessage() {
  var chatMessage = {
    userId: currentUserKey,
    msgType: "normal/text",
    msg: document.getElementById("txtMessage").value,
    dateTime: new Date().toLocaleString(),
  };
  firebase
    .database()
    .ref("chatMessage")
    .child(chatKey)
    .push(chatMessage, function (error) {
      if (error) {
        alert(error);
      } else {
        document.getElementById("txtMessage").value = "";
      }
    });
}
////////////////////////////
//Send Image Function
function chooseImage() {
  document.getElementById("imgFile").click();
}
function sendImage(event) {
  var file = event.files[0];
  if (!file.type.match("image.*")) {
    alert("Please select image only.");
  } else {
    // alert("corect")
    var reader = new FileReader();

    reader.addEventListener(
      "load",
      function () {
        // alert(reader.result)
        var chatMessage = {
          userId: currentUserKey,
          msgType: "image",
          msg: reader.result,
          dateTime: new Date().toLocaleString(),
        };
        firebase
          .database()
          .ref("chatMessage")
          .child(chatKey)
          .push(chatMessage, function (error) {
            if (error) {
              alert(error);
            } else {
              document.getElementById("txtMessage").value = "";
              document.getElementById("txtMessage").focus();
            }
          });
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  }
}
///////////////////////////////////

function loadChatList() {
  var db = firebase.database().ref("friend_list");
  db.on("value", function (lists) {
    document.getElementById(
      "lstChat"
    ).innerHTML = `<li class="list-group-item" style="background-color:#f8f8f8">
                                                         <input type="text" placeholder="Seach Here" class="form-control form-rounded">
                                                        </li>`;
    lists.forEach(function (data) {
      var lst = data.val();
      var friendKey = "";
      if (lst.friendId === currentUserKey) {
        friendKey = lst.userId;
      } else if (lst.userId === currentUserKey) {
        friendKey = lst.friendId;
      }
      if (friendKey !== "") {
        firebase
          .database()
          .ref("users")
          .child(friendKey)
          .on("value", function (data) {
            var user = data.val();
            document.getElementById(
              "lstChat"
            ).innerHTML += `<li class="list-group-item list-group-item-action"
                     onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                    <div class="row">
                        <div class="col-2 col-sm-2 col-md-2 col-lg-2">
                            <img class="rounded-circle FriendPic" src="${user.photoURL}" alt="">
                        </div>
                        <div class="col-10 col-sm-10 col-md-10 col-lg-10" style="cursor: pointer;">
                            <div class="name">${user.name}</div>
                            <div class ="under-name">This is some message text....</div>
                        </div>
                    </div>
                </li>`;
          });
      }
    });
  });
}
// make all user list send request function
function populateFriendList() {
  document.getElementById(
    "lstfriend"
  ).innerHTML = `<div class="text-center mt-10">
                                                        <span class="spinner-border txt-primary" style = "width : 7rem; height:7rem " role="status"></span>
                                                    </div>`;
  var db = firebase.database().ref("users");
  var list = "";
  db.on("value", function (users) {
    if (users.hasChildren()) {
      list = `<li class="list-group-item" style="background-color:#f8f8f8">
                        <input type="text" placeholder="Seach Here" class="form-control form-rounded">
                    </li>`;
    }
    users.forEach(function (data) {
      var user = data.val();
      if (user.email !== firebase.auth().currentUser.email) {
        list += `<li data-dismiss="modal" class="list-group-item list-group-item-action" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" class ="FriendPic rounded-circle">
                    </div>
                    <div class="col-md-10">
                        <div class="name">${user.name}</div>
                    </div>
                </div>
            </li>`;
      }
    });
    document.getElementById("lstfriend").innerHTML = list;
  });
}
function signIn() {
  //   alert("singIn");
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      var token = result.credential.accessToken;
      var user = result.user;
      console.log(result);

      window.location.replace("chat.html");
      // ...
    })
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      // ...
      console.log("response" + error);
    });
}

function signOut() {
  firebase.auth().signOut();
  window.location.replace("index.html");
}
function onFirebaseStateChange() {
  firebase.auth().onAuthStateChanged(onStateChange);
}
function onStateChange(user) {
  if (user) {
    var userProfile = {
      email: firebase.auth().currentUser.email,
      name: firebase.auth().currentUser.displayName,
      photoURL: firebase.auth().currentUser.photoURL,
    };

    var db = firebase.database().ref("users");
    var flag = false;
    db.on("value", function (user) {
      user.forEach(function (data) {
        var user = data.val();
        if (user.email === userProfile.email) {
          currentUserKey = data.key;
          flag = true;
        }
      });
      if (flag === false) {
        firebase.database().ref("users").push(userProfile, callback);
      } else {
        document.getElementById(
          "imgProfile"
        ).src = firebase.auth().currentUser.photoURL;
        document.getElementById(
          "imgProfile"
        ).title = firebase.auth().currentUser.displayName;
        document.getElementById("SignIn").style = "display:none";
        document.getElementById("linkSignOut").style = "";
      }
      document.getElementById("linkChat").classList.remove("disabled");
      loadChatList();
    });
  } else {
    document.getElementById("imgProfile").src = "Images/pp.jpg";
    document.getElementById("imgProfile").title = "";
    document.getElementById("SignIn").style.display = "";
    document.getElementById("linkSignOut").style = "display:none";
    document.getElementById("lstChat").innerHTML = "";

    document.getElementById("linkChat").classList.add("disabled");
  }
}

function callback(error) {
  if (error) {
    alert("wrong" + error);
  } else
    document.getElementById(
      "imgProfile"
    ).src = firebase.auth().currentUser.photoURL;
  document.getElementById(
    "imgProfile"
  ).title = firebase.auth().currentUser.displayName;
  document.getElementById("SignIn").style = "display:none";
  document.getElementById("linkSignOut").style = "";
}
// ////
onFirebaseStateChange();

////////////////////////////////////////
// render emoji function
loadEmojies();
function loadEmojies() {
  var emoji = "";
  for (i = 128512; i <= 128567; i++) {
    emoji += `<a href="#" style="font-size:22px" onclick="getEmojie(this)">&#${i};</a>`;
  }
  for (i = 128577; i <= 128580; i++) {
    emoji += `<a href="#" style="font-size:22px" onclick="getEmojie(this)">&#${i};</a>`;
  }
  for (i = 129296; i <= 129301; i++) {
    emoji += `<a href="#" style="font-size:22px" onclick="getEmojie(this)">&#${i};</a>`;
  }
  for (i = 129312; i <= 129327; i++) {
    emoji += `<a href="#" style="font-size:22px" onclick="getEmojie(this)">&#${i};</a>`;
  }
  for (i = 129488; i <= 129488; i++) {
    emoji += `<a href="#" style="font-size:22px" onclick="getEmojie(this)">&#${i};</a>`;
  }
  document.getElementById("Smiley").innerHTML = emoji;
}
function showEmojiPanal() {
  document.getElementById("emoji").classList.remove("d-none");
}
function hideEmojiPanel() {
  document.getElementById("emoji").classList.add("d-none");
}
function getEmojie(controle) {
  document.getElementById("txtMessage").value += controle.innerHTML;
}
///////////////////////////
// change icon whenn send some text
function changeSendIcon(controle) {
  if (controle.value !== "") {
    document.getElementById("send").classList.remove("d-none");
    document.getElementById("audio").classList.add("d-none");
  } else {
    document.getElementById("send").classList.add("d-none");
    document.getElementById("audio").classList.remove("d-none");
  }
}
