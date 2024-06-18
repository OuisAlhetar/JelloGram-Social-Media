
document.addEventListener("DOMContentLoaded", (event) => {
  const page = document.body.dataset.page;
  setupUI();
  popLogin();
  popRegister();
  popCreatePost();
  // popEditPost();
  if (page !== "page2" || page !== "page3") {
    showPosts();
    pagination();
  }
  showAccount();
});

function popLogin() {
  var login = document.getElementById("login");
  var btn = document.getElementById("open-login");
  var close = document.getElementById("close-login");

  btn.onclick = function () {
    fetch("login.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("login-body").innerHTML = data;

        var loginForm = document.getElementById("login-form");
        loginForm.addEventListener("submit", function (event) {
          event.preventDefault();
          login();
        });

        login.style.display = "block";
      })
      .catch((error) => console.error("Error loading the login page:", error));
  };

  close.onclick = function () {
    login.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == login) {
      login.style.display = "none";
    }
  };
}

// --------------------------------------------------------------- //

function popRegister() {
  let register = document.getElementById("register");
  let btn = document.getElementById("open-register");
  let close = document.getElementById("close-register");

  btn.onclick = function () {
    fetch("register.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("register-body").innerHTML = data;

        var registerForm = document.getElementById("register-form");
        registerForm.addEventListener("submit", function (event) {
          event.preventDefault();
          register();
        });

        register.style.display = "block";
      })
      .catch((error) => showAlert(error, "danger"));
  };

  close.onclick = () => {
    register.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target == register) {
      register.style.display = "none";
    }
  };
}

// --------------------------------------------------------------- //

function popCreatePost() {
  let createPostPopup = document.getElementById("create-post");
  let addBtn = document.getElementById("add-post");
  let close = document.getElementById("close-create-post");

  if (addBtn) {
    addBtn.onclick = function () {
      fetch("./create-new-post.html")
        .then((response) => response.text()) //return promise
        .then((data) => {
          document.getElementById("create-post-body").innerHTML = data;

          let createPostForm = document.getElementById("create-post-form");
          createPostForm.addEventListener("submit", function (event) {
            event.preventDefault();
            createNewPost();
          });
          createPostPopup.style.display = "block";
        })
        .catch((error) => showAlert(error, "danger"));
    };
  }

  if (close) {
    close.onclick = function () {
       createPostPopup.style.display = "none";
    }
  };

  window.onclick = function (event) {
    if (event.target == createPostPopup) {
      createPostPopup.style.display = "none";
    }
  };
}

// --------------------------------------------------------------- //

function popEditPost() {
  let editPostPopup = document.getElementById("edit-post");
  let editBtn = document.getElementById("edit-post-btn");
  let close = document.getElementById("close-edit-post");

  if (editBtn) {
    editBtn.onclick = function () {
      fetch("./edit-post.html")
        .then((response) => response.text()) //return promise
        .then((data) => {
          document.getElementById("edit-post-body").innerHTML = data;

          let editPostForm = document.getElementById("edit-post-form");
          editPostForm.addEventListener("submit", function (event) {
            event.preventDefault();
          });
          editPostPopup.style.display = "block";
        })
        .catch((error) => showAlert(error, "danger"));
    };
  }

  close.onclick = function () {
    editPostPopup.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == editPostPopup) {
      editPostPopup.style.display = "none";
    }
  };
}

// --------------------------------------------------------------- //

// ################################
// ########## Pagination ##########
// ################################

// ##### old code #####:

// pagination is very important concept in web and the major thing is to give data as parts not in one
// - pages [first-page and last-page]
// - detect reaching to end of page and give the next page...
// - meta in API

// let lastPage = 1;
// function pagination() {
//   let currentPage = 1;

//   // detect the reach at end of page by scrolling:
//   window.addEventListener("scroll", () => {
//     const endOfPage =
//       window.innerHeight + window.scrollY >= document.body.offsetHeight;

//     if (endOfPage && currentPage < lastPage) {
//       currentPage++;
//       showPosts(false, currentPage);
//     }
//   });
// }

// function showPosts(reload = true, page = 1) {
//   axios
//     .get(`https://tarmeezacademy.com/api/v1/posts?limit=5&page=${page}`)
//     .then((response) => {
//       let posts = response.data.data;
//       lastPage = response.data.meta.last_page;

//       if (reload) {
//         document.getElementById("posts-container").innerHTML = ``;
//       }

//       posts.forEach((post) => {
//         let postTitle = post.title || "";

//         let tagsHTML = post.tags
//           .map((tag) => `<div>${tag.name}</div>`)
//           .join("");
//         let content = `
//           <div class="post">
//             <div class="user-info">
//               <img src="${post.author.profile_image}">
//               <div class="name">@${post.author.username}</div>
//             </div>
//             <div class="post-content">
//               <span>${post.created_at}</span>
//               <h3 class="title">${postTitle}</h3>
//               <p>${post.body}</p>
//             </div>
//             <div class="post-image">
//               <img src="${post.image}">
//             </div>
//             <div class="tags">
//               <span class="material-symbols-outlined">comment</span>(<span>${post.comments_count}</span>) Comments:
//               <div class="tags-container">
//                 ${tagsHTML}
//               </div>
//             </div>
//           </div>
//         `;
//         document.getElementById("posts-container").innerHTML += content;
//       });
//     });
// }

// ##### optimized code #####:

let lastPage = 1;
let currentPage = 1;
let isFetching = false;

function pagination() {
  // detect the reach at end of page by scrolling:
  window.addEventListener("scroll", debounce(handleScroll, 100));
}

function handleScroll() {
  const endOfPage =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;

  if (endOfPage && currentPage < lastPage && !isFetching) {
    currentPage++;
    showPosts(false, currentPage);
  }
}

function showPosts(reload = true, page = 1) {
  isFetching = true;

  // ##### show loader Before request #######
  toggleLoader();

  axios
    .get(`https://tarmeezacademy.com/api/v1/posts?limit=20&page=${page}`)
    .then((response) => {
      const posts = response.data.data;
      lastPage = response.data.meta.last_page;

      if (reload) {
        document.getElementById("posts-container").innerHTML = "";
      }

      let content = "";
      posts.forEach((post) => {
        const postTitle = post.title || "";
        const tagsHTML = post.tags
          .map((tag) => `<div>${tag.name}</div>`)
          .join("");

        let editBtnContent = ``;
        let deleteBtnContent = ``;
        // handle edit post btn:

        let user = JSON.parse(localStorage.getItem("user"));
        let isMyPost = user != null && post.author.id == user.id;

        if (isMyPost) {
          editBtnContent = `<button onclick="editPost('${encodeURIComponent(
            JSON.stringify(post)
          )}')" id="edit-post-btn" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#edit-post-modal"
                data-bs-whatever="@mdo">
                  edit
              </button>`;
          deleteBtnContent = `<button onclick="deletePost(${post.id})" id="delete-post-btn" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#delete-post-modal" style="margin: 0 3px;">
                  delete
              </button>`;
        }

        content += `
          <div class="post">
            <div class="user-info">
            <span class="d-flex justify-content-start align-items-center" onclick="goToProfile(${post.author.id});">
              <img src="${post.author.profile_image}" style="width:40px; height: 40px" class="rounded-circle">
              <div class="name">@${post.author.username}</div>
            </span>
              <div style='width: 100%; display: flex; justify-content: end'>
                ${editBtnContent}
                ${deleteBtnContent}
              </div>
            </div>
            <span onclick="postClicked(${post.id});">  
              <div class="post-content" >
                <span>${post.created_at}</span>
                <h3 class="title">${postTitle}</h3>
                <p>${post.body}</p>
              </div>
              <div class="post-image">
                <img src="${post.image}">
              </div>
              <div class="tags">
                <span class="material-symbols-outlined">comment</span>(<span>${post.comments_count}</span>) التعليقات:
                <div class="tags-container">
                  ${tagsHTML}
                </div>
              </div>
            </span>
          </div>
        `;
      });

      document.getElementById("posts-container").innerHTML += content;
    })
    .catch((error) => {
      // handle showing post in profile page: because there aren't post in profile page , ignore showing error:
      let page = document.body.dataset.page;
      if (page !== "page2" && page !== "page3") {
        showAlert("Error fetching posts: " + error, "danger");
        document.getElementById("initial-content").style.display = "block";
      }
    })
    .finally(() => {
      isFetching = false;

      // ######### hide the loader #########
      toggleLoader(false);
    });
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// --------------------------------------------------------------- //

function createNewPost() {
  let title = document.getElementById("post-title").value;
  let body = document.getElementById("post-body").value;
  let image = document.getElementById("post-image").files[0];

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  let url = `https://tarmeezacademy.com/api/v1/posts`;

  // to add post it is very important existence of Token to achieve authentication so we sent the token by the header object which is a part of the third parameter in axios.post (config):
  let token = localStorage.getItem("token");
  let headers = {
    // also because we have file(image) we should sent a header that till the backend that we have a file: in web the file sent as parts not one time so we sent the following header (Content-Type: multipart/form-data)
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };

  
  // rather than use param and assign json object to it , here we use FormData because if there is a file (like image) we can't use json format..

  // ##### show loader Before request #######
  toggleLoader();
  
  axios
    .post(url, formData, {
      headers: headers,
    })
    .then((response) => {
      console.log(response);
      setupUI();
      showAlert("Your post successfully created");
      showPosts();
      document.getElementById("create-post").style.display = "none";
    })
    .catch((error) => {
      let message = error.response.data.message;
      showAlert(message, "danger");
    }).finally(() => {
      // ######### hide the loader #########
      toggleLoader(false);
    });
}

// --------------------------------------------------------------- //

function editPost(postObj) {
  // ####### notes #############

  // [1] it suppose to use the my own popup but some problem occur so i used a bootstrap modal rather than.

  // [2] here we passed an object to this function and this is not acceptable in HTML injected by JS , so we use a way to solve this problem by using ('encodeURIComponent(JSON.stringify(object))' which is passed an object from injected HTML and,,,,, 'JSON.parse(decodeURIComponent(postObj)' which is converted the encoded object to regular object)

  // [3] when we passed object it very very very important to pass the encodeURIComponent(JSON.stringify(object)) inside '' like this :
  // editPost('${encodeURIComponent(JSON.stringify(post))}')

  // [4] it is very important to handle the show of edit button for unauthenticated user

  let post = JSON.parse(decodeURIComponent(postObj));

  // fill the inputs by the value of post (just to improve the User Experience)
  document.getElementById("edit-post-title").value = post.title;
  document.getElementById("edit-post-body").value = post.body;

  document
    .getElementById("edit-post-modal-btn")
    .addEventListener("click", () => {
      let updatedTitle = document.getElementById("edit-post-title").value;
      let updatedBody = document.getElementById("edit-post-body").value;
      let updatedImage = document.getElementById("edit-post-image").files[0];

      let token = localStorage.getItem("token");
      // console.log(updatedTitle, updatedBody);

      let url = `https://tarmeezacademy.com/api/v1/posts/${post.id}`;

      // using formData to sent image:
      let formData = new FormData();
      formData.append("title", updatedTitle);
      formData.append("body", updatedBody);
      formData.append("image", updatedImage);

      // ### very important to Know ###
      // this api is build by using PHP Laravel , and in Laravel is consider PUT method as POST even write PUT , to solve this problem you should sent a header to specify the method explicitly as the following:
      formData.append("_method", "put");

      header = {
        authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      // ##### show loader Before request #######
      toggleLoader();

      // use as POST request:
      axios
        .post(url, formData, {
          headers: header,
        })
        .then((response) => {
          console.log(response);
          setupUI();
          showAlert("Your post successfully updated");
          showPosts();
          let modal = document.getElementById("edit-post-modal");
          let modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
        })
        .catch((error) => {
          let message = error.response.data.message;
          showAlert(message, "danger");
        }).finally(() => {
          // ######### hide the loader #########
          toggleLoader(false);
        });
    });
}

// --------------------------------------------------------------- //

function deletePost(postId) {
  let deleteConfirm = document.getElementById("delete-confirmation");

  let token = localStorage.getItem("token");
  let url = `https://tarmeezacademy.com/api/v1/posts/${postId}`;

  // header = {
  //   "authorization" : `Bearer ${token}`
  // }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Replace with your token
      "Content-Type": "application/json",
    },
  };

  // ##### show loader Before request #######
  toggleLoader();

  deleteConfirm.onclick = () => {
    axios
      .delete(url, config)
      .then((response) => {
        // Handle success
        let modal = document.getElementById("delete-post-modal");
        let modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();

        showAlert("your post successfully Deleted");
        showPosts();
      })
      .catch((error) => {
        // Handle error
        showAlert(error.data.response.message);
      }).finally(() => {
        // ######### hide the loader #########
        toggleLoader(false);
      });
  };
}

// --------------------------------------------------------------- //

function login() {
  let username = document.getElementById("username-external").value;
  let password = document.getElementById("password-external").value;

  // ##### show loader Before request #######
  toggleLoader();

  axios
    .post("https://tarmeezacademy.com/api/v1/login", {
      username: username,
      password: password,
    })
    .then((response) => {
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      showAccount();
      showAlert("Welcome to JelloGram");

      document.getElementById("login").style.display = "none";
      setupUI();
    })
    .catch((error) => {
      let message = error.response.data.message;
      showAlert(message, "danger");
    }).finally(() => {
      // ######### hide the loader #########
      toggleLoader(false);
    });
}

// --------------------------------------------------------------- //

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // for remove the account info:
  document.getElementById("account-info").innerHTML = ``;
  // showAccount();
  setupUI();

  // const page = document.body.dataset.page;
  // if (page === "page2") {
  //   getPost(id)
  // }
  showAlert("You've logged out successfully");
}

// --------------------------------------------------------------- //

function register() {
  let username = document.getElementById("register-username").value;
  let password = document.getElementById("register-password").value;
  let email = document.getElementById("register-email").value;
  let name = document.getElementById("register-name").value;

  // a var for user-image:
  let image = document.getElementById("user-image").files[0];

  let url = `https://tarmeezacademy.com/api/v1/register`;

  // here we don't need this because use the form-data formatting which use to sent files (like user-image in our case)
  // let params = {
  //   username: username,
  //   password: password,
  //   name: name,
  //   email: email,
  // };

  let formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("image", image);
  formData.append("name", name);
  formData.append("email", email);

  let header = {
    "Content-Type": "multipart/form-data",
  };

  // ##### show loader Before request #######
  toggleLoader();
  axios
    .post(url, formData, {
      headers: header,
    })
    .then((response) => {
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      document.getElementById("register").style.display = "none";
      showAccount();
      showAlert("Welcome to JelloGram");
      setupUI();
    })
    .catch((error) => {
      let message = error.response.data.message;
      showAlert(message, "danger");
    }).finally(() => {
      // ######### hide the loader #########
      toggleLoader(false);
    });
}

// --------------------------------------------------------------- //

function showAccount() {
  let token = localStorage.getItem("token");
  let user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    let content = `
    <div id="user-name">${user.name}</div>
    <div id="profile-image">
        <img src="${user.profile_image}" alt="">
    </div>
    `;

    // let sign = `
    //   <span class="material-symbols-outlined">
    //             add
    //   </span>
    // `;

    document.getElementById("account-info").innerHTML = content;
    // document.getElementById("add-post").innerHTML = sign;
  }
  // else {
  //   document.getElementById("account-info").innerHTML = ``;
  //   document.getElementById("add-post").style.display = `none`;
  // }
}

// --------------------------------------------------------------- //

function showAlert(message, type = "success") {
  const alertPlaceholder = document.getElementById("success-alert");
  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `<div>${message}</div>`,
      '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="close"></button>',
      "</div>",
    ].join("");
    alertPlaceholder.append(wrapper);
  };
  alert(message, type);

  setTimeout(() => {
    const alertElement = document.querySelector(".alert");
    if (alertElement) {
      bootstrap.Alert.getOrCreateInstance(alertElement).close();
    }
  }, 3000);
}

// --------------------------------------------------------------- //

function setupUI() {
  const token = localStorage.getItem("token");

  const loginBtn = document.getElementById("open-login");
  const registerBtn = document.getElementById("open-register");
  const logoutBtn = document.getElementById("logout-btn");

  const accountInfo = document.getElementById("account-info");
  const sign = document.getElementById("add-post");
  // const loginRegisterDiv = document.getElementById("login-register-div");
  // const accoutLogoutDiv = document.getElementById("accout-logout-div");

  const deleteBtn = document.getElementById("delete-post-btn");
  const editBtn = document.getElementById("edit-post-btn");

  if (token) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "block";
    accountInfo.style.display = "block";
    if (sign) {
      sign.style.display = "block";
    }

    if (deleteBtn && editBtn) {
      deleteBtn.style.display = "block";
      editBtn.style.display = "block";
    }
  } else {
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    logoutBtn.style.display = "none";
    accountInfo.style.display = "none";
    if (sign) {
      sign.style.display = "none";
    }
    if (deleteBtn && editBtn) {
      deleteBtn.style.display = "none";
      editBtn.style.display = "none";
    }
  }

  showPosts();
}

// --------------------------------------------------------------- //

// i have tried to handle the postClicked() here but i understand that is not practicable:
//  so we handle it in the post-detail.html page

function postClicked(postId) {
  // we will sent the post id to `post-detail.html` page as a query parameter:
  window.location.href = `./post-detail.html?postId=${postId}`;
}

function goToProfile(userId) {
  // alert(userId);
  window.location.href = `./profile.html?userId=${userId}`;
}

function getProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  window.location.href = `./profile.html?localUserId=${user.id}`;
}

// control the Loader:
function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader-container").style.visibility = 'visible';
  } else {
    document.getElementById("loader-container").style.visibility = 'hidden';
  }
}
