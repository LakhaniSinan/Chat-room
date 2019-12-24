
//Initiating the request
//this variable will help us to listen from the server and to send data to the server

var socket = io();



socket.on("connect", function () {

    console.log("connected to a server");


    socket.on('updateUserList', function (users) {

        console.log('User', users)
        var ol = jQuery('<l></ol>');
        users.forEach(function (user) {
            ol.append(jQuery('<li></li>').text(user));
        });
        jQuery('#users').html(ol);
    })
    //============= sending url ==============


    let url = window.location.search;

    socket.emit("join", url, function (error) {
        console.log("There is an error", error)
        if (error) {
            window.location.href = '/'
        }
        else {
            console.log("no error");
        }
    })

})

socket.on("disconnect", function () {
    console.log("server is disconnected")
})

//------------ rendering on the screen -------------

socket.on("newMessage", function (msg) {

    console.log("New Message", msg)

    var formattedMessage = moment(msg.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: msg.text,
        from: msg.from,
        createdAt: formattedMessage
    });
    jQuery('#messages').append(html)



    // var li = jQuery("<li></li>");
    // li.text(`${msg.from} ${formattedMessage}: ${msg.text}`);
    // jQuery("#messages").append(li)
})


//-----------------------------------------

//part2---------------

socket.on("newLocationMessage", function (msg) {

    var formattedMessage = moment(msg.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        from: msg.from,
        url: msg.url,
        createdAt: formattedMessage
    });

    jQuery('#messages').append(html)

});


//part1
jQuery("#message-form").on("submit", function (e) {
    e.preventDefault();

    var messageText = jQuery('[name=message]');

    socket.emit("createMessage", {
        to: "User",
        text: messageText.val()
    }, function () {
        messageText.val('')
    })
})


//============== GEOLOCATION =================

//part2

jQuery("#send-location").on("click", function () {

    navigator.geolocation.getCurrentPosition(function (pos) {
        console.log(pos)
        socket.emit("createLocationMessage", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        })
    })
});


//part3
function myFunction() {
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
        } else {
            for (var i = 0; i < x.files.length; i++) {
                var file = x.files[i];

                if ('name' in file) {
                    txt += file.name;
                }

            }
        }
    }
    else {
        if (x.value == "") {
            txt += "Select one or more files.";
        } else {
            txt += "The files property is not supported by your browser!";
            txt += "The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }

    socket.emit("createFileMessage", txt)


    socket.on('newFileMessage', (txt) => {
        console.log(txt);
    })
    socket.on("newFileMessage", function (msg) {

        console.log("New Message", msg)

        var formattedMessage = moment(msg.createdAt).format('h:mm a');
        var template = jQuery('#message-template').html();
        var html = Mustache.render(template, {
            text: txt,
            from: msg.from,
            createdAt: formattedMessage
        });
        jQuery('#messages').append(html)
    })

}




    //event can be emmited from either client or server
    //1) server emit event called new email
    //2) client will listen to that email when it fires it will get new email
    //1) client will create new message and send to another client for wdhich the server will listen to
