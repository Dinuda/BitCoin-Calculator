// Code goes here

$(function () {

    // globals

    var exchangeRate = 1052.00;
    var fee = 0.45;
    var priceRange = [500, 1500];
    var amountSpent = 100.00;
    var btcReceived = 0.00;


    // Setup

    $('#exchangeRate').val('$' + exchangeRate);
    $('#fee').val(fee + '%');
    $('#priceRange').val('$' + priceRange[0] + ' - $' + priceRange[1]);
    $('#amountSpent').val('$' + amountSpent);


    // Exchange Rate

    $('#exchangeRateSlider').slider({
        range: 'min',
        step: 1.00,
        min: 800.00,
        max: 1200.00,
        value: exchangeRate,
        slide: function (event, ui) {
            changeExchangeRate(ui.value);
        }
    });

    $('#exchangeRate').change(function () {
        var val = remove$Char($(this).val());

        if (isNumber(val))
            changeExchangeRate(val);
    });

    function changeExchangeRate(val) {
        exchangeRate = val;

        $('#exchangeRate').val('$' + exchangeRate);
        $('#exchangeRateSlider').slider('option', 'value', exchangeRate);
        updateResults();
    }


    // Fee

    $('#feeSlider').slider({
        range: 'min',
        step: .01,
        min: 0.00,
        max: 2.00,
        value: fee,
        slide: function (event, ui) {
            changeFee(ui.value);
        }
    });

    $('#fee').change(function () {
        var val = removePercentChar($(this).val());

        if (isNumber(val))
            changeFee(val);
    });

    function changeFee(val) {
        fee = val;

        $('#fee').val(fee + '%');
        $('#feeSlider').slider('option', 'value', fee);
        updateResults();
    }


    // Price Range

    $('#priceRangeSlider').slider({
        range: true,
        step: 0.50,
        min: priceRange[0],
        max: priceRange[1],
        values: priceRange,
        slide: function (event, ui) {
            changePriceRange(ui.values[0], ui.values[1]);
        }
    });

    $('#priceRange').change(function () {
        var pr = splitPriceRange($(this).val());

        if (isNumber(pr[0]) && isNumber(pr[1])) {
            changePriceRange(pr[0], pr[1]);
        }
    });

    function changePriceRange(min, max) {
        priceRange[0] = min;
        priceRange[1] = max;

        $('#priceRange').val('$' + min + ' - $' + max);
        $('#priceRangeSlider').slider('option', 'values', priceRange);
        updateResults();
    }


    // Amount Spent

    $('#amountSpent').change(function () {
        var val = remove$Char($(this).val());

        if (isNumber(val))
            changeAmountSpent(val);
    });

    function changeAmountSpent(val) {
        amountSpent = val;

        $('#amountSpent').val('$' + amountSpent);
        updateResults();
    }



    // Results
    updateResults();

    function updateResults() {
        updatePurchaseResults();

        var minPrice = priceRange[0];
        var maxPrice = priceRange[1];
        var step = $('#exchangeRateSlider').slider('option', 'step');

        var priceStep = (maxPrice - minPrice) / step;
        if (priceStep > 15)
            priceStep = parseInt(priceStep / 15, 10);
        else if (priceStep <= 2)
            priceStep = step;

        var rows = [];
        var count = 0;
        for (var i = minPrice; i <= maxPrice; i += priceStep) {
            var td = createResult(i);

            rows.push(td);

            count++;
            if (count == 15) // bug - doing this causes the list to cut short and exchange rates close to the max price are cut off
                break;
        }

        $("#results").find("tr:gt(0)").remove();
        $('#results').append(rows.join(''));
    }

    function createResult(exchangeRate) {
        var totalAmountReceived = btcReceived * exchangeRate;
        var sellFee = totalAmountReceived * (fee / 100);
        var amountReceived = totalAmountReceived - sellFee;
        var margin = ((amountReceived - amountSpent) / amountSpent) * 100;
        var dispClass;

        if (amountReceived > amountSpent)
            dispClass = 'success';
        else if (amountReceived < amountSpent)
            dispClass = 'danger';

        var tdExchangeRate = '<td><span>$' + exchangeRate.toFixed(2) + '</span></td>';
        var tdFee = '<td><span>$' + sellFee.toFixed(4) + '</span></td>';
        var tdAmountReceived = '<td><span>$' + amountReceived.toFixed(2) + '</span></td>';
        var tdMargin = '<td><span class="' + dispClass + '">' + margin.toFixed(2) + '%</span></td>';

        return '<tr>' + tdExchangeRate + tdFee + tdAmountReceived + tdMargin + '</tr>';
    }

    function updatePurchaseResults() {
        var dFee = amountSpent * (fee / 100);
        var dAmountSpentOnBtc = amountSpent - dFee;

        btcReceived = dAmountSpentOnBtc / exchangeRate;

        $('#totalAmountSpent').text('$' + amountSpent);
        $('#feeAmount').text('$' + dFee.toFixed(5));
        $('#amountSpentOnBtc').text('$' + dAmountSpentOnBtc);
        $('#btcReceived').text(btcReceived.toFixed(8));
    }



    // Helpers

    function remove$Char(string) {
        return string.replace('$', '');
    }

    function removePercentChar(string) {
        return string.replace('%', '');
    }

    function splitPriceRange(string) {

        var pr = string.split('-');

        pr[0] = remove$Char(pr[0]).trim();
        pr[1] = remove$Char(pr[1]).trim();

        return pr;
    }

    function isNumber(val) {
        return !isNaN(parseFloat(val)) && isFinite(val);
    }

});