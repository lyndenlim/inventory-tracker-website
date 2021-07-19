const grailedFee = 0.09
const paypalFeePercent = 0.029
const paypalInternationalFee = 0.044
const paypalFeeFlat = 0.30
const ebayFee = 0.1235
const ebayFlatFee = 0.30
const ebayInternationalFee = 0.0165
const level1 = 0.095
const level2 = 0.09
const level3 = 0.085
const level4 = 0.08
const stockFeeFlat = 0.03

$(".grailedFeeButton").on("click", function(){
    var salePrice = Number($(".grailedSalePrice").val());
    var shippingCharge = Number($(".grailedShippingCharge").val());
    var shippingCost = Number($(".grailedShippingCost").val());
    var grailedPayment = $(".grailedPayment").val();
    var results = calculateGrailed(salePrice, shippingCharge , shippingCost, grailedPayment)
    if(shippingCharge >= 0 && shippingCost >= 0 && salePrice > 0){
        if(grailedPayment === "No"){
            $(".grailedFee").text(`$${results[0].toFixed(2)}`)
            $(".grailedPaypalFee").text(`$${results[1].toFixed(2)}`)
            $(".grailedTotal").text(`$${results[3].toFixed(2)}`);
        } else {
            $(".grailedFee").text(`$${results[0].toFixed(2)}`)
            $(".grailedPaypalFee").text(`$${results[2].toFixed(2)}`)
            $(".grailedTotal").text(`$${results[4].toFixed(2)}`);
        }
    } else {
        alert("Please enter a number greater than 0 or check that all required fields are not empty.")
    } 
})

function calculateGrailed(salePrice, shippingCharge, shippingCost){
    var totalGrailedFee = (salePrice + shippingCharge) * grailedFee
    var totalPaypalFee = (salePrice + shippingCharge) * paypalFeePercent + paypalFeeFlat
    var totalPaypalInternationalFee =  (salePrice + shippingCharge) * paypalInternationalFee + paypalFeeFlat
    var totalFee = totalGrailedFee + totalPaypalFee - shippingCharge + shippingCost
    var totalInternationalFee = totalGrailedFee + totalPaypalInternationalFee - shippingCharge + shippingCost
    var received = salePrice - totalFee
    var receivedInternational = salePrice - totalInternationalFee
    return [totalGrailedFee, totalPaypalFee, totalPaypalInternationalFee, received, receivedInternational]
}

$(".ebayFeeButton").on("click", function(){
    var salePrice = Number($(".ebaySalePrice").val()); 
    var shippingCost = Number($(".ebayShippingCost").val());
    var category = $(".category").val();
    var ebayPayment = $(".ebayPayment").val();
    var results = calculateEbay(salePrice, shippingCost)
    if(shippingCost >= 0 && salePrice > 0){
        if(category === "Other" && ebayPayment === "No"){
            $(".ebayFee").text(`$${results[0].toFixed(2)}`)
            $(".ebayTotal").text(`$${results[2].toFixed(2)}`);
        } else if(category === "Athletic Shoes" && ebayPayment == "No" && salePrice >= 100) {
            $(".ebayFee").text("$0.00")
            $(".ebayTotal").text(`$${results[3].toFixed(2)}`);
        } else if(category === "Athletic Shoes" && ebayPayment == "No" && salePrice < 100) {
            $(".ebayFee").text(`$${results[0].toFixed(2)}`)
            $(".ebayTotal").text(`$${results[2].toFixed(2)}`);  
        } else if(category === "Athletic Shoes" && ebayPayment == "Yes" && salePrice < 100) {
            $(".ebayFee").text(`$${results[1].toFixed(2)}`)
            $(".ebayTotal").text(`$${results[5].toFixed(2)}`);
        } else if(category === "Other" && ebayPayment === "Yes") {
            $(".ebayFee").text(`$${results[1].toFixed(2)}`)
            $(".ebayTotal").text(`$${results[5].toFixed(2)}`);
        } else {
            $(".ebayFee").text("$0.00")
            $(".ebayTotal").text(`$${results[4].toFixed(2)}`);
        }

    } else {
        alert("Please enter a number greater than 0 or check that all required fields are not empty.")
    } 
})

function calculateEbay(salePrice, shippingCost){
    var totalFee = salePrice * ebayFee + ebayFlatFee
    var totalInternationalFee = salePrice * (ebayFee + ebayInternationalFee) + ebayFlatFee
    var totalSneakerInternationalFee = salePrice * ebayInternationalFee + ebayFlatFee
    var received = salePrice - totalFee - shippingCost
    var receivedInternational = salePrice - totalInternationalFee - shippingCost
    var receivedSneaker = salePrice - shippingCost
    var receivedSneakerInternational = salePrice - totalSneakerInternationalFee - shippingCost
    return [totalFee, totalInternationalFee, received, receivedSneaker, receivedSneakerInternational, receivedInternational]
}

$(".stockFeeButton").on("click", function(){
    var salePrice = Number($(".stockSalePrice").val());
    var sellerLevel = $(".sellerLevel").val();
    var results = calculateStock(salePrice)
    if((salePrice > 0) && (sellerLevel === "1") && (salePrice * level1 >= 7)){
        $(".stockFee").text(`$${results[0].toFixed(2)}`)
        $(".stockTotal").text(`$${results[4].toFixed(2)}`);
    } else if((salePrice > 0) && (sellerLevel === "1") && (salePrice * level1 < 7)){
        $(".stockFee").text(`$${results[12].toFixed(2)}`)
        $(".stockTotal").text(`$${results[8].toFixed(2)}`);
    } else if ((salePrice > 0) && (sellerLevel === "2") && (salePrice * level2 >= 7)){
        $(".stockFee").text(`$${results[1].toFixed(2)}`)
        $(".stockTotal").text(`$${results[5].toFixed(2)}`);
    } else if ((salePrice > 0) && (sellerLevel === "2") && (salePrice * level2 < 7)){
        $(".stockFee").text(`$${results[12].toFixed(2)}`)
        $(".stockTotal").text(`$${results[9].toFixed(2)}`);
    } else if ((salePrice > 0) && (sellerLevel === "3") && (salePrice * level3 >= 7)){
        $(".stockFee").text(`$${results[2].toFixed(2)}`)
        $(".stockTotal").text(`$${results[6].toFixed(2)}`);   
    } else if ((salePrice > 0) && (sellerLevel === "3") && (salePrice * level3 < 7)){
        $(".stockFee").text(`$${results[12].toFixed(2)}`)
        $(".stockTotal").text(`$${results[10].toFixed(2)}`);   
    } else if ((salePrice > 0) && (sellerLevel === "4") && (salePrice * level4 >= 7)){
        $(".stockFee").text(`$${results[3].toFixed(2)}`)
        $(".stockTotal").text(`$${results[7].toFixed(2)}`);   
    } else if ((salePrice > 0) && (sellerLevel === "4") && (salePrice * level4 < 7)){
        $(".stockFee").text(`$${results[12].toFixed(2)}`)
        $(".stockTotal").text(`$${results[11].toFixed(2)}`);   
    } else {
        alert("Please enter a number greater than 0 or check that all required fields are not empty.")
    }
})

function calculateStock(salePrice){
    var minimumFee = 7
    var feeLevel1 = salePrice * level1
    var feeLevel2 = salePrice * level2
    var feeLevel3 = salePrice * level3
    var feeLevel4 = salePrice * level4
    var transactionFee = salePrice * stockFeeFlat
    var totalMinFee = minimumFee + transactionFee
    var totalFeeLevel1 = feeLevel1 + transactionFee
    var totalFeeLevel2 = feeLevel2 + transactionFee
    var totalFeeLevel3 = feeLevel3 + transactionFee
    var totalFeeLevel4 = feeLevel4 + transactionFee
    var receivedMinLevel1 = salePrice - minimumFee - transactionFee
    var receivedLevel1 = salePrice - feeLevel1 - transactionFee
    var receivedMinLevel2 = salePrice - minimumFee - transactionFee
    var receivedLevel2 = salePrice - feeLevel2 - transactionFee
    var receivedMinLevel3 = salePrice - minimumFee - transactionFee
    var receivedLevel3 = salePrice - feeLevel3 - transactionFee
    var receivedMinLevel4 = salePrice - minimumFee - transactionFee
    var receivedLevel4 = salePrice - feeLevel4 - transactionFee

    return [totalFeeLevel1, totalFeeLevel2, totalFeeLevel3, totalFeeLevel4, receivedLevel1, receivedLevel2, receivedLevel3, receivedLevel4, 
        receivedMinLevel1, receivedMinLevel2, receivedMinLevel3, receivedMinLevel4, totalMinFee]
}

$(".grailedResetButton").on("click", function(){
    $(".grailedSalePrice").val("");
    $(".grailedShippingCharge").val("");
    $(".grailedShippingCost").val("");
    $(".grailedPayment").prop("selectedIndex", 0);
    $(".grailedFee").text("")
    $(".grailedPaypalFee").text("")
    $(".grailedTotal").text("");
   
});

$(".ebayResetButton").on("click", function(){
    $(".ebaySalePrice").val("");
    $(".ebayShippingCost").val("");
    $(".category").prop("selectedIndex", 0);
    $(".ebayPayment").prop("selectedIndex", 0);
    $(".ebayFee").text("")
    $(".ebayPaypalFee").text("")
    $(".ebayTotal").text("");
   
});

$(".stockResetButton").on("click", function(){
    $(".stockSalePrice").val("");
    $(".sellerLevel").prop("selectedIndex", 0);
    $(".stockFee").text("");
    $(".stockTotal").text("");
   
});