$(document).ready(function() {
    $('#searchInput').on('keyup', function() {
        let value = $(this).val().toLowerCase();

        $('.igeo-card').filter(function() {
            $(this).toggle($(this).find('.text-xl').text().toLowerCase().indexOf(value) > -1);
        });
    });
});