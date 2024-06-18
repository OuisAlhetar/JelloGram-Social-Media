urlParams = new URLSearchParams(window.location.search);
const idOfUser = urlParams.get("userId");

// for user that already login : it access to him profile from the navbar button (profile)
const localUser = urlParams.get("localUserId");
// base URL:
const baseURL = `https://tarmeezacademy.com/api/v1`;

function getUser(userId) {
  let url = `${baseURL}/users/${userId}`;

  // ##### show loader Before request #######
  toggleLoader();
  axios
    .get(url)
    .then((response) => {
      let user = response.data.data;

      document.getElementById("profile-div").innerHTML = ``;
      let content = `
                <div class="profile-user-img">
                    <img src="${user.profile_image}" alt="">
                </div>

                <div class="profile-user-info">
                    <div>${user.username}</div>
                    <div>${user.name}</div>
                    <div>${user.email}</div>
                </div>

                <div class="count-posts-comments">
                    <div>
                        <span>${user.posts_count}</span>.Posts
                    </div>
                    <div>
                        <span>${user.comments_count}</span>.Comments
                    </div>
                </div>
            `;
      document.getElementById("profile-div").innerHTML = content;

      // Post owner username:
      document.getElementById("profile-user-name").innerHTML =
        user.username + "'s Posts";
    })
    .catch((error) => {
      let message = error.response.data.message;
      showAlert(message, "danger");
    }).finally(() => {
      // ######### hide the loader #########
      toggleLoader(false);
    })
}

getUser(idOfUser);
getUserPost(idOfUser);
getLocalProfile(localUser);

function getUserPost(userId) {
  let url = `${baseURL}/users/${userId}/posts`;

  // ##### show loader Before request #######
  toggleLoader();

  axios
    .get(url)
    .then((response) => {
      const posts = response.data.data.reverse();
      document.getElementById("posts-div").innerHTML = "";

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

      document.getElementById("posts-div").innerHTML += content;
      setupUI();
    })
    .catch((error) => {
      // handle showing post in profile page: because there aren't post in profile page , ignore showing error:
      let page = document.body.dataset.page;
      if (page !== "page2" && page !== "page3") {
        showAlert("Error fetching posts: " + error, "danger");
        document.getElementById("initial-content").style.display = "block";
      }
    }).finally(() => {
      // ######### hide the loader #########
      toggleLoader(false);
    });
}

function getLocalProfile(localUserId) {
  getUser(localUserId);
  getUserPost(localUserId);
}
