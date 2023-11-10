let map;

// Определите функцию для сопоставления с таблицей reestr
function matchingReestrId(markerId) {
    const matchingItem = reestrData.find(reestrItem => reestrItem.id === parseInt(markerId, 10));
    return matchingItem !== undefined;
}
document.addEventListener('DOMContentLoaded', function () {
    let visibleRowCount = 0;

    fetch('/reestr')
        .then(response => response.json())
        .then(data => {
            reestrData = data;
            data.forEach(collegeData => {
                var row = document.createElement('tr');

                var numberCell = document.createElement('td');
                numberCell.textContent = collegeData.id;
                row.appendChild(numberCell);

                var districtCell = document.createElement('td');
                districtCell.textContent = collegeData.subject_rf;
                row.appendChild(districtCell);

                var nameCell = document.createElement('td');
                nameCell.textContent = collegeData.cpde;
                row.appendChild(nameCell);

                var workshopCell = document.createElement('td');
                workshopCell.textContent = collegeData.profession_specialty;
                row.appendChild(workshopCell);

                var codeCell = document.createElement('td');
                codeCell.textContent = collegeData.code;
                row.appendChild(codeCell);

                var descriptionCell = document.createElement('td');
                descriptionCell.textContent = collegeData.description;
                row.appendChild(descriptionCell);

                var validUntilCell = document.createElement('td');
                validUntilCell.textContent = formatDateString(collegeData.valid_until);
                row.appendChild(validUntilCell);

                const tableBody = document.querySelector('tbody');
                if (tableBody) {
                    tableBody.appendChild(row);
                }
                if (row.style && row.style.display !== 'none') {
                    visibleRowCount++;
                }
            });

            updateRecordCount();
        });

    function formatDateString(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    let hasMatch = true;
    const professionFilter = document.getElementById('profession-filter');
    professionFilter.addEventListener('input', applyProfessionFilter);

    const initialRowCount = document.querySelectorAll('.table tbody tr').length;
    visibleRowCount = initialRowCount;
    updateRecordCount();

    function updateRecordCount() {
        const rowCountDisplay = document.getElementById('record-count');
        rowCountDisplay.textContent = `Показано записей: ${visibleRowCount}`;
    }
    function applyProfessionFilter() {
        const professionFilterValue = professionFilter.value.toLowerCase();
        const rows = document.querySelectorAll('.table tbody tr');
        visibleRowCount = 0;

        // Фильтрация маркеров
        map.geoObjects.each(geoObject => {
            const professionSpecialty = geoObject.properties.get('professionSpecialty');
            if (professionSpecialty && professionSpecialty.includes(professionFilterValue)) {
                geoObject.options.set('visible', true);
            } else {
                geoObject.options.set('visible', false);
            }
        });

        // Фильтрация таблицы
        rows.forEach(row => {
            const profession = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            if (!profession.includes(professionFilterValue)) {
                row.style.display = 'none';
            } else {
                row.style.display = 'table-row';
                visibleRowCount++;
            }
        });

        updateRecordCount();
    }
    document.getElementById('college-table').style.display = 'table';
});

ymaps.ready(function () {
    map = new ymaps.Map('yandex-map', {
        center: [54.716074346691585, 56.01490669299098],
        zoom: 10
    });
    map.controls.remove('geolocationControl'); // удаляем геолокацию
    map.controls.remove('searchControl'); // удаляем поиск
    map.controls.remove('trafficControl'); // удаляем контроль трафика
    map.controls.remove('typeSelector'); // удаляем тип
    map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
    map.controls.remove('zoomControl'); // удаляем контрол зуммирования
    map.controls.remove('rulerControl'); // удаляем контрол правил
    fetch('/addMarkersToMap')
        .then(response => response.json())
        .then(data => {
            markersData = data;
            data.forEach(collegeData => {
                const coordinates = extractCoordinatesFromMapLink(collegeData.map_link);
                var marker = new ymaps.Placemark(coordinates, {
                    hintContent: collegeData.organization_name,
                    balloonContent: collegeData.address
                });
                marker.properties.set('markerId', collegeData.id);
                marker.properties.set('professionSpecialty', collegeData.profession_specialty.toLowerCase());
                map.geoObjects.add(marker);
            });
        });
});

function extractCoordinatesFromMapLink(mapLink) {
    const regex = /ll=([\d.]+),([\d.]+)/;
    const match = mapLink.match(regex);
    if (match && match[1] && match[2]) {
        const lat = parseFloat(match[2]);
        const lon = parseFloat(match[1]);
        return [lat, lon];
    }
    return [0, 0];
}
