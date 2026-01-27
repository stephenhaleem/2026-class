const supabaseUrl = "https://jaeayaedtvzueucsctvo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZWF5YWVkdHZ6dWV1Y3NjdHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTcwNzIsImV4cCI6MjA4NDQ3MzA3Mn0.Kg3-3ztDu0Y39dZCzSRORaHzvOClSkdleQrDuZ90cII";


const client = supabase.createClient(supabaseUrl, supabaseKey);

// CREATE POST (NO LOGIN)
document.getElementById("addPost").onclick = async () => {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const author = document.getElementById("author").value;

  const { error } = await client
    .from("posts")
    .insert({ title, content, author});

  if (error) {
    alert(error.message);
  } else {
    alert("Post added!");
    loadPosts();
  }
};

// READ POSTS (PUBLIC)
async function loadPosts() {
  const { data, error } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  data.forEach(post => {
    postsDiv.innerHTML += `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p>${post.author}</p>
      <small>${post.created_at}</small>
      <hr>
    `;
  });
}

loadPosts();