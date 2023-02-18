declare const document: any;
import { getRandomHash, html, onMount } from "./html-tag-fn.ts";

export async function example(title: string) {
  const hash = getRandomHash()

  const response = await fetch('https://jsonplaceholder.typicode.com/todos/2')
    .then(response => response.json())

  onMount((title: string, hash: string) => {
    document.querySelector(`h1[h="${hash}"]`).textContent = title
  }, title, hash)

  return html`
    <h1 h="${hash}"></h1>
    <table>
      <tbody>
        <tr>
          <td>User Id</td>
          <td>${response.userId}</td>h1
        </tr>
        <tr>
          <td>Id</td>
          <td>${response.id}</td>
        </tr>
        <tr>
          <td>Title</td>
          <td>${response.title}</td>
        </tr>
        <tr>
          <td>Completed</td>
          <td>
            <input
              type="checkbox"
              readonly
              ${response.completed ? 'checked' : ''}
            />
          </td>
        </tr>
      </tbody>
    </table>
  `
}
