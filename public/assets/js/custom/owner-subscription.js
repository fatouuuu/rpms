
$(document).on('click', '#chooseAPlan', function () {
    commonAjax('GET', $('#chooseAPanRoute').val(), setPlanModalData, setPlanModalData);
});

function setPlanModalData(response) {
    var selector = $('#choosePlanModal')
    selector.modal('show');
    selector.find('#planListBlock').html(response.responseText);
}

$(document).on('input', '.quantity', function () {
    var quantity = $(this).val();
    if (parseInt(quantity) < 1) {
        quantity = 1;
    }
    var selector = $(this).closest('form');
    var per_monthly_price = selector.find('input[name=per_monthly_price]').val() ?? 0;
    var per_yearly_price = selector.find('input[name=per_yearly_price]').val() ?? 0;
    var totalPerMonthlyPrice = 0;
    var totalPerYearlyPrice = 0;
    if (parseInt(quantity) > 0) {
        totalPerMonthlyPrice = Number(per_monthly_price) * parseInt(quantity);
        totalPerYearlyPrice = Number(per_yearly_price) * parseInt(quantity);
    }
    var perMonthlyPriceDetails = currencyPrice(visualNumberFormat(per_monthly_price)) + '*' + parseInt(quantity) + '=' + currencyPrice(visualNumberFormat(totalPerMonthlyPrice));
    var perYearlyPriceDetails = currencyPrice(visualNumberFormat(per_monthly_price)) + '*' + parseInt(quantity) + '=' + currencyPrice(visualNumberFormat(totalPerYearlyPrice));
    selector.find('.per_monthly_price').text(perMonthlyPriceDetails);
    selector.find('.per_yearly_price').text(perYearlyPriceDetails);
});

$(document).on('change', '.quantity', function () {
    var quantity = $(this).val();
    if (parseInt(quantity) < 1) {
        $(this).val(1)
    } else {
        $(this).val(parseInt(quantity))
    }
});

var requestCurrentPlan = $('#requestCurrentPlan').val();
if (requestCurrentPlan == 'no') {
    $('#chooseAPlan').trigger('click');
}

$(document).on('change', '#monthly-yearly-button', function () {
    if ($(this).is(':checked') == true) {
        $(document).find('.price-yearly').removeClass('d-none');
        $(document).find('.price-monthly').addClass('d-none');
        $(document).find('.plan_type').val(2);
    }
    else {
        $(document).find('.price-yearly').addClass('d-none');
        $(document).find('.price-monthly').removeClass('d-none');
        $(document).find('.plan_type').val(1);
    }
});

window.addEventListener('load', function () {
    if ($('#requestPlanId').val()) {
        let response = { 'responseText': $('#gatewayResponse').val() };
        setPaymentModal(response)
    }
})

function setPaymentModal(response) {
    var selector = $('#paymentMethodModal')
    selector.modal('show');
    $('#choosePlanModal').modal('hide');
    selector.find('#gatewayListBlock').html(response.responseText);
}

$(document).on('click', '.paymentGateway', function (e) {
    e.preventDefault();

    $(this).closest('#gatewaySection').find('button').removeClass('active')
    $(this).closest('#gatewaySection').find('.payment-method-item').removeClass('border border-primary')
    $(this).parent().addClass('border border-primary')
    $(this).addClass('active')
    var selectGateway = $(this).data('gateway').replace(/\s+/g, '');
    $('#selectGateway').val(selectGateway)
    $('#selectCurrency').val('');
    $('#plan_id').val($(this).data('plan_id'));
    $('#duration_type').val($(this).data('duration_type'));
    $('#quantity').val($(this).data('quantity'));
    commonAjax('GET', $('#getCurrencyByGatewayRoute').val(), getCurrencyRes, getCurrencyRes, { 'id': $(this).data('id') });
    if (selectGateway == 'bank') {
        $('#bankAppend').removeClass('d-none');
        $('#bank_slip').attr('required', true);
        $('#bank_id').attr('required', true);
    } else {
        $('#bank_slip').attr('required', false);
        $('#bank_id').attr('required', false);
        $('#bankAppend').addClass('d-none');
    }
});

function getCurrencyRes(response) {
    var html = '';
    var planAmount = parseFloat($('#planAmount').val()).toFixed(2);
    var planPerAmount = parseFloat($('#planPerAmount').val() ?? 0).toFixed(2);
    Object.entries(response.data).forEach((currency) => {
        let currencyAmount = currency[1].conversion_rate * Number(planAmount) + Number(planPerAmount);
        html += `<tr>
                    <td>
                        <div class="custom-radiobox gatewayCurrencyAmount">
                            <input type="radio" name="gateway_currency_amount" id="${currency[1].id}" class="" value="${gatewayCurrencyPrice(Number(currencyAmount).toFixed(2), currency[1].symbol)}">
                            <label for="${currency[1].id}">${currency[1].currency}</label>
                        </div>
                    </td>
                    <td><h6 class="tenant-invoice-tbl-right-text text-end">${gatewayCurrencyPrice(Number(planAmount).toFixed(2) + Number(planPerAmount).toFixed(2))} * ${currency[1].conversion_rate} = ${gatewayCurrencyPrice(Number(currencyAmount).toFixed(2), currency[1].symbol)}</h6></td>
                </tr>`;
    });
    $('#currencyAppend').html(html);
}

$(document).on('click', '.gatewayCurrencyAmount', function () {
    var getCurrencyAmount = '(' + $(this).find('input').val() + ')';
    $('#gatewayCurrencyAmount').text(getCurrencyAmount)
    $('#selectCurrency').val($(this).text().replace(/\s+/g, ''));
});

$(document).on('change', '#bank_id', function () {
    $('#bankDetails').removeClass('d-none');
    $('#bankDetails p').html($(this).find(':selected').data('details'));
});

$('#payBtn').on('click', function () {
    var gateway = $('#selectGateway').val()
    var currency = $('#selectCurrency').val();
    if (gateway == '') {
        toastr.error('Select Gateway');
        $('#payBtn').attr('type', 'button');
    } else {
        if (currency == '') {
            toastr.error('Select Currency');
            $('#payBtn').attr('type', 'button');
        } else {
            $('#payBtn').attr('type', 'submit');
        }
    }
});
