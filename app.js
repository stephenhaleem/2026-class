const supabaseUrl = "https://ctzgeasemjukwlsfixrc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emdlYXNlbWp1a3dsc2ZpeHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MzQ4MjksImV4cCI6MjA4NDAxMDgyOX0.xxiFsVMZ0LmQ9pDPxqbJ3cQ8QvNnx9b-0nIJdX4Jf3M";

const client = supabase.createClient(supabaseUrl, supabaseKey);


async function signUp() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const { error } = await client.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Check your email to confirm");
}

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

async function logout() {
  await client.auth.signOut();
  window.location.href = "index.html";
}


async function createPost() {
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageInput = document.getElementById("image");

  if (!titleInput.value || !contentInput.value) return;

  const title = titleInput.value;
  const content = contentInput.value;
  const file = imageInput.files[0];

  const { data: { user } } = await client.auth.getUser();
  if (!user) return alert("Not logged in");

  let imageUrl = null;

  if (file) {
    const fileName = `${Date.now()}-${file.name}`;
    await client.storage
      .from("post-images")
      .upload(fileName, file);

    imageUrl = client.storage
      .from("post-images")
      .getPublicUrl(fileName).data.publicUrl;
  }

  await client.from("posts").insert({
    title,
    content,
    image_url: imageUrl,
    user_id: user.id
  });

  titleInput.value = "";
  contentInput.value = "";
  imageInput.value = "";

  loadMyPosts();
}

async function loadPosts() {
  const container = document.getElementById("posts");
  if (!container) return;

  const { data } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  container.innerHTML = "";

  data.forEach(post => {
    container.innerHTML += `
      <div class="post">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        ${post.image_url ? `<img src="${post.image_url}">` : ""}
      </div>
    `;
  });
}

loadPosts();

async function loadMyPosts() {
  const container = document.getElementById("my-posts");
  if (!container) return;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return;

  const { data } = await client
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  container.innerHTML = "";

  data.forEach(post => {
    container.innerHTML += `
      <div class="post">
        <h3>${post.title}</h3>
        <p>${post.content}</p>

        ${post.image_url 
          ? `<img src="${post.image_url}" />` 
          : ""
        }

        <button onclick="deletePost('${post.id}', '${post.image_url || ""}')">
          Delete
        </button>
      </div>
    `;
  });
}

async function deletePost(id) {
  await client.from("posts").delete().eq("id", id);
  loadMyPosts();
}

loadMyPosts();
