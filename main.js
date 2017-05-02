var database = firebase.database();

function calculateSum() {
    var sum = 0;
    $("#sumTotal").text(sum.toFixed(2));
    $(".sumThis").each(function () {

        var value = $(this).text();
        // add only if the value is number
        if (!isNaN(value) && value.length !== 0) {
            sum += parseFloat(value);
        }
        $('#sumTotal').text(sum.toFixed(2));
    });
}

function loadData() {
    var userId = firebase.auth().currentUser.uid;
    // Retrieve new posts as they are added to our database
    database.ref('expenses/' + userId).once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val(),
                desc = childData.description,
                amount = parseFloat(childData.amount).toFixed(2),
                dataKey = childSnapshot.key,
                newRow = $('.expenses').append('<tr><td class="col s6">' + desc + '</td><td class="col s5 sumThis">' + amount + '</td><td class="col s1"><a name="' + dataKey + '" class="red-text text-lighten-1 removeValue"><i class="material-icons left">delete</i></a></td></tr>').hide();
            newRow.slideDown('fast', function () {
                calculateSum();
            });
        });
    });
}

function loadApp() {
    var emailId = firebase.auth().currentUser.email;
    $('#profile').text(emailId.split('@')[0]);
    $('#signin').hide();
    $('#signup').hide();
    $('#app').show();
    $('#link-profile').show();
    $('form').trigger('reset');
    $('form input').blur();
    loadData();
}

$('table').on('click', 'tbody tr td a', function () {
    var keyVal = $(this).prop("name"),
        td = $(this).parent(),
        tr = td.parent();
    tr.slideUp(500, function () {
        database.ref('expenses').child(keyVal).remove();
        tr.remove();
        calculateSum();
    });
});

$('#submit').click(function () {

    if (!$('#amount').val() || $('#amount').val().match(/\s/g) || parseFloat($('#amount').val()) === 0) {
        $('#amount').addClass('invalid').focus();
    } else if (isNaN($('#amount').val())) {
        $('#amount').addClass('invalid');
        $('#amount').next('label').attr('data-error', 'Please enter a numeric value');
    } else {
        var userId = firebase.auth().currentUser.uid,
            form = $('#addExpense'),
            desc = $('#description').val(),
            amount = parseFloat($('#amount').val()).toFixed(2),
            data = form.serializeJSON(),
            dataKey = database.ref('expenses/' + userId).push(data).key,
            newRow = $('<tr><td class="col s6">' + desc + '</td><td class="col s5 sumThis">' + amount + '</td><td class="col s1"><a name="' + dataKey + '" class="red-text text-lighten-1 removeValue"><i class="material-icons left">delete</i></a></td></tr>').hide();
        $('.expenses').append(newRow);
        form.trigger('reset');
        $('#amount').removeClass('invalid');
        $(form).find('label').removeClass('active');
        $('#amount').blur();
        newRow.slideDown(500, function () {
            calculateSum();
        });
    }
});


$('#signin-button').click(function () {
    var email = $('#signin-email'),
        password = $('#signin-password');

    firebase.auth().signInWithEmailAndPassword(email.val(), password.val()).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        if (error) {
            if (errorCode === 'auth/invalid-email') {
                $('#signin-email').addClass('invalid').focus();
                $('#signin-email').addClass('invalid');
                $('#signin-email').next('label').attr('data-error', errorMessage);
            }
            if (errorCode === 'auth/wrong-password') {
                $('#signin-password').addClass('invalid').focus();
                $('#signin-password').addClass('invalid');
                $('#signin-password').next('label').attr('data-error', errorMessage);
            }
            if (errorCode === 'auth/user-not-found') {
                $('#signin-password').addClass('invalid');
                $('#signin-password').next('label').attr('data-error', 'User does not exist. Pleas signup or check credentials.');
                $('#signin').hide();
                $('#signup').show();
            }
        }
    });
});

$('#signup-button').click(function () {
    var email = $('#signup-email'),
        password = $('#signup-password'),
        cpassword = $('#confirm-password');

    if (email.val() === '') {
        email.addClass('invalid').focus().next('label').attr('data-error', 'Please enter a valid email address');
    }
    if (password.val() === '' || password.val().length <= 5) {
        password.addClass('invalid').focus().next('label').attr('data-error', 'Please enter a password of 6 characters or more');
    }
    if (password.val() !== cpassword.val()) {
        cpassword.addClass('invalid').focus().next('label').attr('data-error', 'Passwords dont match');
    }
    else {
        firebase.auth().createUserWithEmailAndPassword(email.val(), password.val()).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            if (error) {
                if (errorCode === 'auth/email-already-in-use') {
                    email.addClass('invalid').focus().next('label').attr('data-error', errorMessage);
                }
            }
        });
    }
});

$('#logout').click(function () {
    firebase.auth().signOut().then(function () {
        $('#signin').show();
        $('#app').hide();
        $('form').trigger('reset');
        $('tbody').find('tr').remove().end();
        // Sign-out successful.
    }, function (error) {
        // An error happened.
    });
});

$('#landing').click(function () {
    $('#signin').fadeOut();
    $('#signup').fadeIn();
});

$(document).ready(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            loadApp();
            // User is signed in.
        }
        else {
            $('#signin').show();
        }
    });
});