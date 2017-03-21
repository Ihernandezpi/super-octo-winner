 $.fn.extend({
     animateCss: function (animationName) {
         var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
         this.addClass('animated ' + animationName).one(animationEnd, function () {
             $(this).removeClass('animated ' + animationName);
         });
     }
 });


 $(function () {
     $("#loader").click(function (evt) {
         evt.preventDefault();
     });
     $(".logobarra").sideNav();
     $(".button-collapse").sideNav();
     $('.right.button-collapse').sideNav({
         menuWidth: 300, // Default is 300
         edge: 'right', // Choose the horizontal origin
         closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
         draggable: true // Choose whether you can drag to open on touch screens
     });

     var config = {
         apiKey: "AIzaSyAtnSc9DANI34EmxkHjQ-2RGmwewERoatY",
         authDomain: "adreammexico-sandbox.firebaseapp.com",
         databaseURL: "https://adreammexico-sandbox.firebaseio.com",
         storageBucket: "adreammexico-sandbox.appspot.com",
         messagingSenderId: "550795420848"
     };
     firebase.initializeApp(config);
     firebase.auth().onAuthStateChanged(function (user) {
         if (user) {
             hideLogin();
             hideLoader();
         } else {
             showLogin();
             hideLoader();
         }
         $("#singinButton").click(singIn);
     });
 });

 function singIn() {
     if (!firebase.auth().currentUser) {
         var provider = new firebase.auth.GoogleAuthProvider();
         provider.addScope('https://www.googleapis.com/auth/plus.login');
         firebase.auth().signInWithPopup(provider).then(function (result) {
             var token = result.credential.accessToken;
             var user = result.user;
             var database = firebase.database();
             database.ref("users/" + user.uid).set({
                 username: user.displayName,
                 email: user.email,
                 profile_picture: user.photoURL
             });
             hideLogin();
         }).catch(function (error) {
             var errorCode = error.code;
             var errorMessage = error.message;
             var email = error.email;
             var credential = error.credential;
             if (errorCode === 'auth/account-exists-with-different-credential') {
                 alert('You have already signed up with a different auth provider for that email.');
             } else {
                 console.error(error);
             }
         });
     } else {
         firebase.auth().signOut();
     }
 }

 function hideLogin() {
     var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
     $("#loginPage").addClass('animated fadeOut').one(animationEnd, function () {
         $("#loginPage").hide();
         $("#loginPage").removeClass('animated fadeOut');
         showPanel();
     });
 }

 function showLogin() {
     $('#loginPage').show();
     $('#loginPage').animateCss("fadeIn");
     hidePanel();

 }

 function showPanel() {
     $('#panel').show();
     $('#panel').animateCss("fadeIn");
     initPanel();
     showView('home');
 }

 function hidePanel() {
     var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
     $("#panel").addClass('animated fadeOut').one(animationEnd, function () {
         $("#panel").hide();
         $("#panel").removeClass('animated fadeOut');
     });

 }

 function showLoader() {
     $("#loader").show();
 }

 function hideLoader() {
     $("#loader").hide();
 }

 function initPanel() {
     var user = firebase.auth().currentUser;
     $("#user-info-nav a[href='#!user'] img").attr("src", user.photoURL);
     $("#user-info-nav a[href='#!name'] span").text(user.displayName);
     $("#user-info-nav a[href='#!email'] span").text(user.email);
     $('a[href="#!singout"]').click(singout);
     $(".buttonView").click(showView);
     $("#addButton").click(addButtonClick);
 }

 function singout() {
     firebase.auth().signOut();
     showLogin();
 }

 function showView(name) {
     var viewName;
     if (typeof name == 'string') {
         viewName = name;
     } else {
         viewName = $(this).data('view');
     }

     if (viewName == "home") {
         $(".nav-content").hide();
     } else {
         switch (viewName) {
             case "products":
                 $(".nav-title").text('Productos');
                 fillProducts();
                 break;
             case "sales":
                 $(".nav-title").text('Ventas');
                 break;
         }
         $(".nav-content").show();

     }
     $(".view").hide();
     $("div#" + viewName).show();
 }
 var tableProducts = $();
 var productsStructure;

 function fillProducts() {

     var database = firebase.database();
     /*database.ref('productsStructure').once('value').then(function (structure) {
         $(".productsTable").remove();
         tableProducts.remove();
         productsStructure = structure.val();
         tableProducts = $('<table id="productsTable" class="highlight"><tbody></tbody></table>');
         var thead = $('<thead></thead>'),
             tr = $("<tr></tr>");
         thead.append(tr);
         tableProducts.append(thead);
         for (var key in productsStructure) {
             var val = productsStructure[key];
             tr.append($('<th data-field="' + key + '">' + val.label + '</th>'));
         }
         initForm();
         database.ref('products').once('value').then(function (snapshot) {
             var products = snapshot.val();
             for (var index in products) {
                 var product = products[index];
                 addProductToTable(product, index);
             }
             if (tableProducts != undefined) {
                 $('.tableside').append(tableProducts);
             } else {
                 //Show empty table
             }
         });

     });*/

     database.ref('productsStructure').on('value', function (structure) {
         $(".productsTable").remove();
         tableProducts.remove();
         productsStructure = structure.val();
         tableProducts = $('<table id="productsTable" class="highlight"><tbody></tbody></table>');
         var thead = $('<thead></thead>'),
             tr = $("<tr></tr>");
         thead.append(tr);
         tableProducts.append(thead);
         for (var key in productsStructure) {
             var val = productsStructure[key];
             tr.append($('<th data-field="' + key + '">' + val.label + '</th>'));
         }
         initForm();
         /*database.ref('products').on('value', function (snapshot) {
             var products = snapshot.val();
             for (var index in products) {
                 var product = products[index];
                 addProductToTable(product, index);
             }
             if (tableProducts != undefined) {
                 $('.tableside').append(tableProducts);
             }

         });*/
         database.ref('products').on('child_added', function (snapshot) {
             var product = snapshot.val();
             addProductToTable(product, snapshot.key);
             if (tableProducts != undefined) {
                 $('.tableside').append(tableProducts);
             }
         });
         database.ref('products').on('child_changed', function (snapshot) {
             var product = snapshot.val();
             addProductToTable(product, snapshot.key);
             if (tableProducts != undefined) {
                 $('.tableside').append(tableProducts);
             }

         });
         database.ref('products').on('child_removed', function (snapshot) {
             var product = snapshot.val();
             removeProductToTable(product, snapshot.key);
             if (tableProducts != undefined) {
                 $('.tableside').append(tableProducts);
             }

         });
     });





 }

 function addProductToTable(product, productKey) {
     if (tableProducts.find("tr[data-id='" + productKey + "']")) {
         tableProducts.find("tr[data-id='" + productKey + "']").remove();
     }
     var row = $("<tr data-id='" + productKey + "'></tr>");
     row.click(editProduct);
     for (var key in productsStructure) {
         var itemP = product[key] == undefined ? "" : product[key],
             th = $('<th data-item="' + key + '">' + itemP + '</th>');
         row.append(th);
     }
     tableProducts.find("tbody").append(row);

 }

 function removeProductToTable(product, productKey) {
     if (tableProducts.find("[data-id='" + productKey + "']")) {
         tableProducts.find("[data-id='" + productKey + "']").remove();
     }
 }

 function editProduct() {
     var product = $(this);
     editForm.find("#idProduct").val(product.data("id"));
     for (var key in productsStructure) {
         editForm.find('#' + key).val(product.find("[data-item=" + key + "]").text());
         editForm.find("label[for='" + key + "']").addClass("active");
     }
     editForm.find("#deleteProduct").show();
 }

 function saveProduct() {
     var form = $(this).parent(),
         id = form.find("#idProduct").val();
     var productObject = {};
     for (var key in productsStructure) {
         productObject[key] = form.find('#' + key).val();
     }
     var database = firebase.database();
     if (id != undefined && id != "") { //Editar
         database.ref('products/' + id).set(productObject);
     } else { //Nuevo
         database.ref('products/').push(productObject);
     }
     addButtonClick();
 }

 var editForm = $();

 function initForm() {
     editForm.remove();
     editForm = $('<form class="col s12"><div class="row"><input id="idProduct" type="hidden" value=""></div></form>');
     for (var key in productsStructure) {
         var itemP = productsStructure[key];
         editForm.find(".row").append("<div class='input-field col s6'><input id='" + key + "' type='text'/><label  for='" + key + "'>" + itemP.label + "</label></div>")
     }
     var button = $('<button id="saveProduct" class="btn waves-effect waves-light" name="action">Guardar <i class="material-icons right">send</i></button>');
     button.click(saveProduct);
     editForm.append(button);
     var buttonDelete = $('<button id="deleteProduct" class="btn waves-effect waves-light red darken-1" name="action">Eliminar <i class="material-icons right">delete</i></button>');
     buttonDelete.click(deleteProduct);
     buttonDelete.hide();
     editForm.append(buttonDelete);
     $('.editside').append(editForm);
 }

 function deleteProduct() {
     var form = $(this).parent(),
         id = form.find("#idProduct").val();
     if (id != undefined && id != "") {
         firebase.database().ref("products/" + id).remove();
         addButtonClick();
     }
 }

 function addButtonClick() {
     var conteinerVisible = $(".view:visible");
     if (conteinerVisible.length > 0) {
         switch (conteinerVisible[0].id) {
             case "products":
                 editForm.find("input").each(function (index, item) {
                     $(item).val("");
                 });
                 editForm.find("#deleteProduct").hide();
                 break;
             case "sales":

                 break;
             case "home":

                 break;
         }
     }
 }