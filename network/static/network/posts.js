document.addEventListener('DOMContentLoaded', () => {
  load_page(1);
  try {
    document.getElementById('following-btn').onclick = () => {
      following(1);
    }
    document.getElementById('my-profile').onclick = () => {
      profile(document.querySelector('#my-profile').dataset.username, 1);
    }
  } catch {}
});

function load_page(page) {
  console.log(page);
  window.scrollTo(0, 0);  
  try {
    document.querySelector('#posts-list').innerHTML = '';
    document.querySelector('#profile-navigation').style.display = 'none';
    document.querySelector('#following-navigation').style.display = 'none';
    document.querySelectorAll('.page-changer-num').forEach((button) => {
      button.remove();
    });
  } catch {}
  fetch(`/posts/${page}`)
  .then(response => response.json())
  .then(posts => {
    for (let i = 1; i < posts.length; i++) {
      let div = document.createElement('div');
      let utcdate = posts[i].timestamp;
      let localDate = new Date(utcdate);
      localDate = localDate.toLocaleString()
      if (posts[i].liked === false && posts[i].editable === true) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="like" data-id="${posts[i].id}">
            <span class="material-symbols-outlined inline-icon outline">
            favorite
            </span>
              ${posts[i].likes}
            </button>
            <button class="edit" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                edit
              </span>
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === true && posts[i].editable === true) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="unlike" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                favorite
              </span>
              ${posts[i].likes}
            </button>
            <button class="edit" data-id="${posts[i].id}" title="Edit">
              <span class="material-symbols-outlined inline-icon fill">
                edit
              </span>
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === true && posts[i].editable === false) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="unlike" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                favorite
              </span>
              ${posts[i].likes}
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === false && posts[i].editable === false) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="like" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon outline">
                favorite
              </span>
              ${posts[i].likes}
            </button>
          </div>
        </div>
        `;
      }
      document.querySelector('#posts-list').append(div);
    }
    document.querySelectorAll('.profile-btn').forEach(button => {
      button.onclick = () => {
        profile(button.dataset.username, 1);
      }
    });

    if (posts[0].page_num == 1) {
      document.querySelector('#posts-next').className = 'page-item disabled';
      document.querySelector('#posts-previous').className = 'page-item disabled';
    } else if (page == 1) {
      document.querySelector('#posts-previous').className = 'page-item disabled';
      document.querySelector('#posts-next').className = 'page-item';
    } else if (page == posts[0].page_num) {
      document.querySelector('#posts-next').className = 'page-item disabled';
      document.querySelector('#posts-previous').className = 'page-item';
    } else {
      document.querySelector('#posts-next').className = 'page-item';
      document.querySelector('#posts-previous').className = 'page-item';
    }

    document.querySelector('#posts-previous').onclick = () => {
      if (document.querySelector('#posts-previous').className.includes('disabled') === false)
        load_page(parseInt(page) - 1);
    }
    document.querySelector('#posts-next').onclick = () => {
      if (document.querySelector('#posts-next').className.includes('disabled') === false)
        load_page(parseInt(page) + 1);
    }

    for (let i = 0; i < posts[0].page_num; i++) {
      if (page == i+1) {
        document.querySelector('#posts-next').insertAdjacentHTML('beforebegin', `<li class="page-item page-changer page-changer-num active" data-page="${i + 1}"><button class="page-link">${i + 1}</button></li>`);
      } else {
      document.querySelector('#posts-next').insertAdjacentHTML('beforebegin', `<li class="page-item page-changer page-changer-num" data-page="${i + 1}"><button class="page-link">${i + 1}</button></li>`);
      }
    }
    document.querySelectorAll('.page-changer').forEach(button => {
      button.onclick = function() {
        load_page(button.dataset.page);
      }
    });

    document.querySelectorAll('.like').forEach(button => {
      button.onclick = () => {
        Like(button);
      }
    });
    document.querySelectorAll('.unlike').forEach(button => {
      button.onclick = () => {
        Unlike(button);
      }
    });

    document.querySelectorAll('.edit').forEach(button => {
      button.onclick = () => {
        button.style.display = 'none';
        let text = document.getElementById(`${button.dataset.id}`).innerHTML;
        document.getElementById(`${button.dataset.id}`).innerHTML = `
          <form class="editor">
            <textarea class="form-control rounded-1" rows="3" name="text">${text}</textarea>
            <button class="btn btn-sm rounded-3" type="submit">Submit</button>
            <input type="hidden" value="${button.dataset.id}" name="id">
          </form>
        `;
        document.querySelectorAll('.editor').forEach(form => {
          form.addEventListener('submit', event => {
            event.preventDefault();
            formData = new FormData(form);
            let id = formData.get('id');
            let text = formData.get('text');
            edit(id, text);
            button.style.display = 'inline-block';
          });
        });
      }
    });
  });
}

function Like(button) {
  fetch(`/posts/like/${button.dataset.id}`)
    .then(response => response.json())
    .then(response => {
      console.log(response);
        button.innerHTML = `
        <span class="material-symbols-outlined inline-icon fill">
          favorite
        </span>
        ${response.likes}`;
        button.className = 'unlike';
        document.querySelectorAll('.unlike').forEach(button => {
          button.onclick = () => {
            Unlike(button);
          }
        });
    });
}

function Unlike(button) {
  fetch(`/posts/unlike/${button.dataset.id}`)
    .then(response => response.json())
    .then(response => {
      console.log(response);
        button.innerHTML = `
          <span class="material-symbols-outlined inline-icon outline">
            favorite
          </span>
        ${response.likes}`;
        button.className = 'like';
        document.querySelectorAll('.like').forEach(button => {
          button.onclick = () => {
            Like(button);
          }
        });
    });
}

function edit(id, text) {
  fetch('posts/edit', {
    method: 'POST',
    body: JSON.stringify({
      id: id,
      text: text
    })
  })
  .then(response => response.json())
  .then(result => {
    document.getElementById(`${id}`).innerHTML = result.text;
  });
}

function profile(username, page) {
  fetch(`load_profile/${username}/${page}`)
  .then(response => response.json())
  .then(posts => {
    window.scrollTo(0, 0);
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#profile-navigation').style.display = 'block';
    document.querySelector('#following-navigation').style.display = 'none';

    document.querySelector('#following-posts').innerHTML = '';
    document.querySelector('#posts-list').innerHTML = '';

    document.querySelector('#profile-title').innerHTML = `<h2>${posts[1].creator}'s Profile</h2>`;


    try {
      document.querySelector('#profile-posts').innerHTML = '';
        document.querySelectorAll('.page-changer-num').forEach(button => {
          button.remove();
        });
      } catch {}
      if (posts[0].visitor != posts[1].creator && posts[0].visitor != false) {
        if (posts[0].following === true) {
            document.querySelector('#follow-unfollow').innerHTML = `
            <h6 id="followers_count">${posts[0].followers_count} Follower</h6>
            <h6 id="followings_count">${posts[0].followings_count} Following</h6>
            <button class="btn rounded-4 unfollow">Unfollow</button>`;
        } else {
          document.querySelector('#follow-unfollow').innerHTML = `
          <h6 id="followers_count">${posts[0].followers_count} Follower</h6>
          <h6 id="followings_count">${posts[0].followings_count} Following</h6>
          <button class="btn rounded-4 follow">Follow</button>`;
        }
        document.querySelectorAll('.unfollow').forEach(button => {
          button.onclick = () => {
            unfollow(posts[1].creator_id);
          }
        });
        document.querySelectorAll('.follow').forEach(button => {
          button.onclick = () => {
            follow(posts[1].creator_id);
          }
        });
      } else {
        document.querySelector('#follow-unfollow').innerHTML = `
          <h6 id="followers_count">${posts[0].followers_count} Follower</h6>
          <h6 id="followings_count">${posts[0].followings_count} Following</h6>
        `;
      }

    for (let i = 1; i < posts.length; i++) {
      let div = document.createElement('div');
      let utcdate = posts[i].timestamp;
      let localDate = new Date(utcdate);
      localDate = localDate.toLocaleString()
      if (posts[i].liked === false && posts[i].editable === true) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by ${posts[i].creator} at ${localDate}</p>
            <button class="like" data-id="${posts[i].id}">
            <span class="material-symbols-outlined inline-icon outline">
            favorite
            </span>
              ${posts[i].likes}
            </button>
            <button class="edit" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                edit
              </span>
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === true && posts[i].editable === true) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by ${posts[i].creator} at ${localDate}</p>
            <button class="unlike" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                favorite
              </span>
              ${posts[i].likes}
            </button>
            <button class="edit" data-id="${posts[i].id}" title="Edit">
              <span class="material-symbols-outlined inline-icon fill">
                edit
              </span>
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === true && posts[i].editable === false) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by ${posts[i].creator} at ${localDate}</p>
            <button class="unlike" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                favorite
              </span>
              ${posts[i].likes}
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === false && posts[i].editable === false) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by ${posts[i].creator} at ${localDate}</p>
            <button class="like" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon outline">
                favorite
              </span>
              ${posts[i].likes}
            </button>
          </div>
        </div>
        `;
      }
      document.querySelector('#profile-posts').append(div);
    }
    if (posts[0].page_num == 1) {
      document.querySelector('#profile-next').className = 'page-item disabled';
      document.querySelector('#profile-previous').className = 'page-item disabled';
    } else if (page == 1) {
      document.querySelector('#profile-previous').className = 'page-item disabled';
      document.querySelector('#profile-next').className = 'page-item';
    } else if (page == posts[0].page_num) {
      document.querySelector('#profile-next').className = 'page-item disabled';
      document.querySelector('#profile-previous').className = 'page-item';
    }
    document.querySelector('#profile-previous').onclick = () => {
      if (document.querySelector('#profile-previous').className.includes('disabled') === false)
        profile(username, page - 1);
    }
    document.querySelector('#profile-next').onclick = () => {
      if (document.querySelector('#profile-next').className.includes('disabled') === false)
      profile(username, page + 1);
    }

    for (let i = 0; i < posts[0].page_num; i++) {
      if (page == i+1) {
        document.querySelector('#profile-next').insertAdjacentHTML('beforebegin', `<li class="page-item page-changer page-changer-num active" data-page="${i + 1}"><button class="page-link">${i + 1}</button></li>`);
      } else {
        document.querySelector('#profile-next').insertAdjacentHTML('beforebegin', `<li class="page-item page-changer page-changer-num" data-page="${i + 1}"><button class="page-link">${i + 1}</button></li>`);
      }
    }
    document.querySelectorAll('.page-changer').forEach(button => {
      button.onclick = function() {
        profile(username ,button.dataset.page);
      }
    });

    document.querySelectorAll('.like').forEach(button => {
      button.onclick = () => {
        Like(button);
      }
    });
    document.querySelectorAll('.unlike').forEach(button => {
      button.onclick = () => {
        Unlike(button);
      }
    });

    document.querySelectorAll('.edit').forEach(button => {
      button.onclick = () => {
        button.style.display = 'none';
        let text = document.getElementById(`${button.dataset.id}`).innerHTML;
        document.getElementById(`${button.dataset.id}`).innerHTML = `
          <form class="editor">
            <textarea class="form-control rounded-1" rows="3" name="text">${text}</textarea>
            <button class="btn btn-sm rounded-3" type="submit">Submit</button>
            <input type="hidden" value="${button.dataset.id}" name="id">
          </form>
        `;
        document.querySelectorAll('.editor').forEach(form => {
          form.addEventListener('submit', event => {
            event.preventDefault();
            formData = new FormData(form);
            let id = formData.get('id');
            let text = formData.get('text');
            edit(id, text);
            button.style.display = 'inline-block';
          });
        });
      }
    });
  });
}

function follow(id) {
  fetch(`follow/${id}`)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      if (result.followed === true) {
        document.querySelector('#follow-unfollow').innerHTML = `
        <h6>${result.followers} Follower</h6>
        <h6>${result.followings} Following</h6>
        <button class="btn rounded-4 unfollow">Unfollow</button>`;
      } else if (result.followed === false) {
        document.querySelector('#follow-unfollow').innerHTML = `
        <h6>${result.followers} Follower</h6>
        <h6>${result.followings} Following</h6>
        <button class="btn rounded-4 follow">Follow</button>`;
      }
      document.querySelectorAll('.unfollow').forEach(button => {
        button.onclick = () => {
          unfollow(id);
        }
      });
      document.querySelectorAll('.follow').forEach(button => {
        button.onclick = () => {
          follow(id);
        }
      });
    });
}

function unfollow(id) {
  fetch(`unfollow/${id}`)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      if (result.followed === true) {
        document.querySelector('#follow-unfollow').innerHTML = `
        <h6>${result.followers} Follower</h6>
        <h6>${result.followings} Following</h6>
        <button class="btn rounded-4 unfollow">Unfollow</button>`;
      } else if (result.followed === false) {
        document.querySelector('#follow-unfollow').innerHTML = `
        <h6>${result.followers} Follower</h6>
        <h6>${result.followings} Following</h6>
        <button class="btn rounded-4 follow">Follow</button>`;
      }
      document.querySelectorAll('.unfollow').forEach(button => {
        button.onclick = () => {
          unfollow(id);
        }
      });
      document.querySelectorAll('.follow').forEach(button => {
        button.onclick = () => {
          follow(id);
        }
      });
    });
}

function following(page) {
  window.scrollTo(0, 0);  
  try {
    document.querySelector('#posts-title').style.display = 'none';
    document.querySelector('#posts-list').innerHTML = '';
    document.querySelector('#following-posts').innerHTML = '';
    document.querySelector('#profile-posts').innerHTML = '';
    document.querySelector('#follow-unfollow').innerHTML = '';
    document.querySelector('#profile-title').innerHTML = `<h2>Following</h2>`;

    document.querySelector('#profile-navigation').style.display = 'none';
    document.querySelector('#posts-navigation').style.display = 'none';
    document.querySelector('#following-navigation').style.display = 'block';
      document.querySelectorAll('.page-changer-num').forEach((button) => {
        button.remove();
      });
  } catch {}
  fetch(`following/${page}`)
  .then(response => response.json())
  .then(posts => {
    for (let i = 1; i < posts.length; i++) {
      let div = document.createElement('div');
      let utcdate = posts[i].timestamp;
      let localDate = new Date(utcdate);
      localDate = localDate.toLocaleString()
      if (posts[i].liked === false && posts[i].editable === true) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="like" data-id="${posts[i].id}">
            <span class="material-symbols-outlined inline-icon outline">
            favorite
            </span>
              ${posts[i].likes}
            </button>
            <button class="edit" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                edit
              </span>
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === true && posts[i].editable === true) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="unlike" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                favorite
              </span>
              ${posts[i].likes}
            </button>
            <button class="edit" data-id="${posts[i].id}" title="Edit">
              <span class="material-symbols-outlined inline-icon fill">
                edit
              </span>
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === true && posts[i].editable === false) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="unlike" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon fill">
                favorite
              </span>
              ${posts[i].likes}
            </button>
          </div>
        </div>
        `;
      } else if (posts[i].liked === false && posts[i].editable === false) {
        div.innerHTML = `
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title" id="${posts[i].id}">${posts[i].text}</h5>
            <hr>
            <p class="card-text">Posted by<button class="profile-btn" data-username="${posts[i].creator}">@${posts[i].creator}</button>at ${localDate}</p>
            <button class="like" data-id="${posts[i].id}">
              <span class="material-symbols-outlined inline-icon outline">
                favorite
              </span>
              ${posts[i].likes}
            </button>
          </div>
        </div>
        `;
      }
      document.querySelector('#following-posts').append(div);
    }
    document.querySelectorAll('.profile-btn').forEach(button => {
      button.onclick = () => {
        profile(button.dataset.username, 1);
      }
    });

    if (posts[0].page_num == 1) {
      document.querySelector('#following-next').className = 'page-item disabled';
      document.querySelector('#following-previous').className = 'page-item disabled';
    } else if (page == 1) {
      document.querySelector('#following-previous').className = 'page-item disabled';
      document.querySelector('#following-next').className = 'page-item';
    } else if (page == posts[0].page_num) {
      document.querySelector('#following-next').className = 'page-item disabled';
      document.querySelector('#following-previous').className = 'page-item';
    }

    document.querySelector('#following-previous').onclick = () => {
      if (document.querySelector('#following-previous').className.includes('disabled') === false)
        following(page - 1);
    }
    document.querySelector('#following-next').onclick = () => {
      if (document.querySelector('#following-next').className.includes('disabled') === false)
      following(page + 1);
    }

    for (let i = 0; i < posts[0].page_num; i++) {
      if (page == i+1) {
        document.querySelector('#following-next').insertAdjacentHTML('beforebegin', `<li class="page-item page-changer page-changer-num active" data-page="${i + 1}"><button class="page-link">${i + 1}</button></li>`);
      } else {
      document.querySelector('#following-next').insertAdjacentHTML('beforebegin', `<li class="page-item page-changer page-changer-num" data-page="${i + 1}"><button class="page-link">${i + 1}</button></li>`);
      }
    }
    document.querySelectorAll('.page-changer').forEach(button => {
      button.onclick = function() {
        following(button.dataset.page);
      }
    });

    document.querySelectorAll('.like').forEach(button => {
      button.onclick = () => {
        Like(button);
      }
    });
    document.querySelectorAll('.unlike').forEach(button => {
      button.onclick = () => {
        Unlike(button);
      }
    });

    document.querySelectorAll('.edit').forEach(button => {
      button.onclick = () => {
        button.style.display = 'none';
        let text = document.getElementById(`${button.dataset.id}`).innerHTML;
        document.getElementById(`${button.dataset.id}`).innerHTML = `
          <form class="editor">
            <textarea class="form-control rounded-1" rows="3" name="text">${text}</textarea>
            <button class="btn btn-sm rounded-3" type="submit">Submit</button>
            <input type="hidden" value="${button.dataset.id}" name="id">
          </form>
        `;
        document.querySelectorAll('.editor').forEach(form => {
          form.addEventListener('submit', event => {
            event.preventDefault();
            formData = new FormData(form);
            let id = formData.get('id');
            let text = formData.get('text');
            edit(id, text);
            button.style.display = 'inline-block';
          });
        });
      }
    });
  });
}