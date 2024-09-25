const modal = document.querySelector(".modal");

openModal.addEventListener('click', () => {
    openCloseModal()
});


openCloseModal = () => {
    modal.classList.toggle('modal-open');
} 