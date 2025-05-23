document.getElementById('searchBtn').addEventListener('click', function() {
    document.getElementById('g1').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('#quickLinks li').forEach(item => {
    item.addEventListener('click', function() {
      document.getElementById('g1').scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Add event listener for 'Enter' key press
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') { // Check if the pressed key is 'Enter'
      document.getElementById('g1').scrollIntoView({ behavior: 'smooth' });
  }
});
// 48823298-f3ff50904aa926e630ba2d55b