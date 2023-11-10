document.addEventListener('DOMContentLoaded', function () {
    let visibleRowCount = 0;

    function updateTableAndMarkers(data) {
        updateTable(data);
        updateMarkers(data);
        updateRecordCount(visibleRowCount);
    }

    const professionFilter = document.getElementById('profession-filter');
    professionFilter.addEventListener('input', applyProfessionFilter);

    const nameFilter = document.getElementById('name-filter');
    nameFilter.addEventListener('input', applyNameFilter);

    fetchDataForSecondPage();

    function fetchDataForSecondPage() {
        fetch('/secondpageData')
            .then(response => response.json())
            .then(data => {
                updateTableAndMarkers(data);
            });
    }

    function updateTable(data) {
        const tableBody = document.querySelector('.table tbody');
        tableBody.innerHTML = ''; // Очистить существующие строки
        visibleRowCount = 0;

        data.forEach(collegeData => {
            var row = document.createElement('tr');
            var numberCell = document.createElement('td');
            numberCell.textContent = collegeData.id;
            row.appendChild(numberCell);

            var districtCell = document.createElement('td');
            districtCell.textContent = collegeData.district;
            row.appendChild(districtCell);

            var nameCell = document.createElement('td');
            nameCell.textContent = collegeData.organization_name;
            row.appendChild(nameCell);

            var workshopCell = document.createElement('td');
            workshopCell.textContent = collegeData.organization_type;
            row.appendChild(workshopCell);

            tableBody.appendChild(row);
            if (row.style && row.style.display !== 'none') {
                visibleRowCount++;
            }
        });
        updateRecordCount(visibleRowCount);
    }

    function applyProfessionFilter() {
        const professionFilterValue = professionFilter.value.toLowerCase();
        const rows = document.querySelectorAll('.table tbody tr');
        visibleRowCount = 0;

        map.geoObjects.each(geoObject => {
            const organizationType = geoObject.properties.get('organization_type');
            const isVisible = organizationType && organizationType.includes(professionFilterValue);
            geoObject.options.set('visible', isVisible);
        });

        rows.forEach(row => {
            const profession = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            if (!profession.includes(professionFilterValue)) {
                row.style.display = 'none';
            } else {
                row.style.display = 'table-row';
                visibleRowCount++;
            }
        });
        updateRecordCount(visibleRowCount);
    }

    function applyNameFilter() {
        const filterValue = nameFilter.value.toLowerCase();
        const rows = document.querySelectorAll('.table tbody tr');
        visibleRowCount = 0;

        map.geoObjects.each(geoObject => {
            const organizationName = geoObject.properties.get('organization_name');
            const isVisible = organizationName && organizationName.includes(filterValue);
            geoObject.options.set('visible', isVisible);
        });

        rows.forEach(row => {
            const organizationName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            if (!organizationName.includes(filterValue)) {
                row.style.display = 'none';
            } else {
                row.style.display = 'table-row';
                visibleRowCount++;
            }
        });

        updateRecordCount(visibleRowCount);
    }

    function updateRecordCount(count) {
        const rowCountDisplay = document.getElementById('record-count');
        rowCountDisplay.textContent = `Показано записей: ${count}`;
    }

    ymaps.ready(function () {
        map = new ymaps.Map('yandex-map', {
            center: [54.716074346691585, 56.01490669299098],
            zoom: 10
        });
        map.controls.remove('geolocationControl');
        map.controls.remove('searchControl');
        map.controls.remove('trafficControl');
        map.controls.remove('typeSelector');
        map.controls.remove('fullscreenControl');
        map.controls.remove('zoomControl');
        map.controls.remove('rulerControl');

        fetchDataForSecondPage();
    });

    function updateMarkers(data) {
        map.geoObjects.removeAll();

        data.forEach(collegeData => {
            const coordinates = extractCoordinatesFromMapLink(collegeData.map_link);
            var marker = new ymaps.Placemark(coordinates, {
                hintContent: collegeData.organization_name,
            });
            marker.properties.set('markerId', collegeData.id);
            marker.properties.set('organization_type', collegeData.organization_type.toLowerCase());
            map.geoObjects.add(marker);
        });
    }

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
});
