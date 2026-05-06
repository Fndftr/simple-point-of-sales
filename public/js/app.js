// Product search filter on POS page
const searchInput = document.getElementById('productSearch');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    document.querySelectorAll('.product-card').forEach(card => {
      const name = card.dataset.name || '';
      card.style.display = name.includes(query) ? '' : 'none';
    });
  });
}
