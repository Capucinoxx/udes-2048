const modal_accept_box = document.getElementById('accept-box');
const modal_accept_btn = document.getElementById('accept-btn');
const modal_decline_btn = document.getElementById('decline-btn');
const modal_content = modal_accept_box.querySelector('.modal-description');

const default_message = `
  <h2>Hmmm ...</h2>
  <p>Si tu as fait des modifications manuelles aux codes, elles seront perdues si tu retournes dans l'édition avec les blocs. Veux-tu tout de même changer ?</p>
`;

const accept_confirm_box = (msg = null) => {
  modal_content.innerHTML = msg === null ? default_message : msg;

  modal_accept_box.style.display = 'block';

  return new Promise((resolve) => {
    const handle_accept = () => {
      resolve(true);
      cleanup();
    };

    const handle_decline = () => {
      resolve(false);
      cleanup();
    };

    modal_accept_btn.addEventListener('click', handle_accept);
    modal_decline_btn.addEventListener('click', handle_decline);

    const cleanup = () => {
      modal_accept_box.style.display = 'none';
      modal_accept_btn.removeEventListener('click', handle_accept);
      modal_decline_btn.removeEventListener('click', handle_decline);
    };
  });
}