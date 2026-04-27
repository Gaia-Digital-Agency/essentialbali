export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
      <h1>Essential Bali CMS</h1>
      <p>Headless Payload CMS. This is the API server, not the public site.</p>
      <ul>
        <li>
          Admin: <a href="/admin">/admin</a>
        </li>
        <li>
          REST API: <code>/api/&lt;collection&gt;</code>
        </li>
        <li>
          GraphQL: <code>/api/graphql</code>
        </li>
      </ul>
    </main>
  );
}
