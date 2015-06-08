function truckPostManageCtrl($scope, $http, $location, $anchorScroll, $filter, UserRequest, TruckRequest, TruckPostRequest) {
    console.log('Inside truckPostManageCtrl - '+$scope.core.clickedTruckId);

    clearAlert("truck_home_alert");
    clearAlert("manage_truckPost_alert");

    $scope.minDate = new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate());
    $scope.gotoHome = function(){
        $scope.page.template = "/TransEarth/truck_owner_home";
        $scope.page.scope = "Truck Owner Home";
    };
    $scope.cancelPost = function(){
        TruckPostRequest.setSharedTruck(null);
        $scope.truckOwnerPage.showPostList=true;
    };

    $scope.pickup = {};
    $scope.pickup.date = new Date();
    $scope.pickup.dateRange = {startDate: null, endDate: null};
    var currentDt = new Date();
    $scope.minDate = new Date();
    $scope.maxDate = new Date(currentDt.getFullYear() + 1);

    $scope.pickup.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.pickup.dateRangeOptions ={
        format: 'DD-MMM-YYYY',
        popup : "dd-MMMM-yyyy",
        "is-open" : "pickup.dateRangeOpened",
        minDate: $scope.minDate,
        maxDate: $scope.maxDate
    };

    $scope.pickup.opened = false;
    $scope.pickup.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        //console.log("pickup.Opened");
        $scope.pickup.opened = true;
    };
    $scope.pickup.startDateOpened = false;
    $scope.pickup.startDateOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        //console.log("pickup.dateRangeOpened");
        $scope.pickup.startDateOpened = true;
    };
    $scope.pickup.endDateOpened = false;
    $scope.pickup.endDateOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        //console.log("pickup.dateRangeOpened");
        $scope.pickup.endDateOpened = true;
    };

    $scope.truckToPost = TruckRequest.getSharedTruck();
    $scope.truckPostToUpdate = TruckPostRequest.getSharedTruck();
    //console.log("truckPostToUpdate data fetched from service: "+$scope.truckPostToUpdate);
    //$scope.truckPostToUpdate.details = {};
    //$scope.truckPostToUpdate.post = {};
    //$scope.truckPostToUpdate.post.pickup = {};
    //$scope.truckPostToUpdate.post.delivery = {};

    var tempTruck = {};
    var tempPost;

    $scope.addTruckPostInd = false;
    $scope.editTruckPostInd = false;
    if(typeof $scope.truckPostToUpdate != "undefined" && $scope.truckPostToUpdate != null){
        console.log("truckPostToUpdate data: "+JSON.stringify($scope.truckPostToUpdate));
        $scope.addTruckPostInd = false;
        $scope.editTruckPostInd = true;
        $scope.page.header = "Update Post";
        $scope.truckPostToUpdate.details = {};
        tempTruck = $scope.truckPostToUpdate;
        //tempPost = $scope.truckPostToUpdate.posts.indexOf(TruckPostRequest.getSharedTruckPostId());
        tempPost = $filter('filter')($scope.truckPostToUpdate.posts, {_id:TruckPostRequest.getSharedTruckPostId()})[0];

        $scope.truckToPost = {};
        $scope.truckToPost = $scope.truckPostToUpdate;
        $scope.truckToPost.details = {};
        $scope.truckToPost.details.schedule = {};
        $scope.truckToPost.post = {};
        $scope.truckToPost.post.schedule = {};
        $scope.truckToPost.post.pickup = {};
        $scope.truckToPost.post.delivery = {};

        //console.log("truckPostToUpdate Truck Data to start with: "+JSON.stringify(tempTruck));
        //console.log("truckPostToUpdate Post Data to start with: "+JSON.stringify(tempPost));
    }else if(typeof $scope.truckToPost != "undefined" && $scope.truckToPost != null){
        $scope.addTruckPostInd = true;
        $scope.editTruckPostInd = false;
        $scope.truckToPost.details = {};
        $scope.truckToPost.details.schedule = {};
        $scope.truckToPost.post = {};
        $scope.truckToPost.post.pickup = {};
        $scope.truckToPost.post.delivery = {};

        //console.log("truckToPost data: "+JSON.stringify($scope.truckToPost));
        $scope.page.header = "Add Post";
        tempTruck = $scope.truckToPost;
        tempPost = null;
        //console.log("truckToPost Data to start with: "+JSON.stringify(tempTruck));
    }

    $scope.truckToPost.details.type = tempTruck.truck_details.type;
    $scope.truckToPost.details.make = tempTruck.truck_details.make;
    $scope.truckToPost.details.model = tempTruck.truck_details.model;
    $scope.truckToPost.details.reg_no = tempTruck.truck_details.reg_no;
    $scope.truckToPost.details.load = tempTruck.truck_details.maximum_load.quantity + " " + tempTruck.truck_details.maximum_load.unit;

    console.log("Refreshing Date picker start");
    var frequency = ["One Time", "Daily", "Weekly", "Monthly"];
    var options = '';
    options += '<option value="">Choose one</option>';
    $.each(frequency, function (i, row) {
        //console.log(JSON.stringify(row));
        if(typeof $scope.truckToPost.details.schedule != "undefined"
            && $scope.truckToPost.details.schedule != null
            && $scope.truckToPost.details.schedule.frequency == row){
            options += '<option selected>' + row + '</option>';
        }else{
            options += '<option>' + row + '</option>';
        }
    });
    applyHtml("post_frequency", options);
    applySelect("post_frequency");
    //$('#post_frequency').selectpicker('refresh');
    console.log("Refreshing Date picker start");

    $scope.showLocations = false;
    $scope.showDateRange = false;
    $scope.showDate = false;
    $scope.getDays = false;

    $scope.trackDays= function(){
        console.log("Tracking Days for frequency "+$scope.truckToPost.post.schedule.frequency);
        $scope.truckToPost.post.pickup.date = null;
        $scope.truckToPost.post.pickup.startDate = null;
        $scope.truckToPost.post.pickup.endDate = null;
        if(typeof $scope.truckToPost.post.schedule.frequency != "undefined" && $scope.truckToPost.post.schedule.frequency != null){
            if($scope.truckToPost.post.schedule.frequency == "Weekly"){
                $scope.dateRange = 7;
            }else if($scope.truckToPost.post.schedule.frequency == "Monthly"){
                $scope.monthRange = 1;
            }else{
                $scope.showLocations = true;
            }
        }
    };

    $scope.truckToPost.post.source = {
        place : "",
        state : "",
        isSelected : false,
        disable : false
    };
    $scope.truckToPost.post.destination = {
        place : "",
        state : "",
        isSelected : false,
        disable : false
    };
    if(typeof tempPost != "undefined" && tempPost != null){
        $scope.truckToPost.post._id = tempPost._id;
        //$scope.truckToPost.post.source.place = tempPost.truck_post.availability.pickup_location;
        //$scope.truckToPost.post.destination.place = tempPost.truck_post.availability.delivery_location;
        $scope.truckToPost.post.source = {
            place : tempPost.truck_post.availability.pickup_location,
            state : "",
            display : tempPost.truck_post.availability.pickup_location,
            isSelected : true,
            disable : false
        };
        $("#source").val(tempPost.truck_post.availability.pickup_location);
        $("#destination").val(tempPost.truck_post.availability.delivery_location);
        $scope.truckToPost.post.destination = {
            place : tempPost.truck_post.availability.delivery_location,
            state : "",
            display : tempPost.truck_post.availability.delivery_location,
            isSelected : true,
            disable : false
        };
        $scope.truckToPost.post.load = tempPost.truck_post.maximum_load.quantity.toString();
        $scope.truckToPost.post.pickup.date = tempPost.truck_post.availability.date;
        $scope.truckToPost.post.pickup.startDate = tempPost.truck_post.availability.start_date;
        $scope.truckToPost.post.pickup.endDate = tempPost.truck_post.availability.end_date;
        $scope.truckToPost.post.schedule.frequency = tempPost.truck_post.availability.schedule;
        $("#post_frequency").val(tempPost.truck_post.availability.schedule);
        $("#post_frequency").selectpicker('refresh');
        $scope.showLocations = true;
    }
    $scope.truckPostForm = {};
    $scope.truckPostProcess = {};
    //$scope.truckPostProcess.function = {};
    $scope.truckPostProcess.indicator = {};
    $scope.truckPostProcess.indicator.showAlert = false;
    //$scope.truckPostProcess.indicator.showCompanyDetails = false;
    //$scope.truckPostProcess.indicator.showOwnerDetails = true;

    // function to submit the form after all validation has occurred
    $scope.reset = function(){
        $scope.truckToPost.post = {};
        $scope.truckToPost.post.schedule = {};
        $scope.truckToPost.post.pickup = {};
        $scope.truckToPost.post.delivery = {};
        $scope.truckToPost.post.source = {
            place : "",
            state : "",
            isSelected : false,
            disable : false
        };
        $scope.truckToPost.post.destination = {
            place : "",
            state : "",
            isSelected : false,
            disable : false
        };
    };

    $scope.submitForm = function () {

        // Set the 'submitted' flag to true
        $scope.truckPostProcess.indicator.showAlert = false;

        if ($scope.truckPostForm.$valid) {
            console.log("truckPostForm Form is valid! "+JSON.stringify($scope.truckToPost));

            if($scope.addTruckPostInd){
                $http.post("/TransEarth/addTruckPost", {
                    truckId : $scope.truckToPost._id,
                    post : $scope.truckToPost.post
                })
                    .success(function(data) {
                        console.log("Truck Post saved successfully");
                        $scope.truckPostProcess.indicator.saved = true;
                        $scope.truckPost = {};
                        $scope.truckPostProcess.indicator.showAlert = true;
                        $scope.truckPostToUpdate = null;
                        $scope.truckToPost = null;
                        TruckPostRequest.setSharedTruck(null);
                        succesAlert("Truck Post added successfully", 'truck_home_alert');
                        $scope.truckOwnerPage.showPostList = true;
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('headerBar');

                        // call $anchorScroll()
                        $anchorScroll();
                    }).error(function(data) {
                        console.log("Truck saved failed:"+data);
                        $scope.truckPostProcess.indicator.saved = false;
                        $scope.truckPostProcess.indicator.showAlert = true;
                        succesError(data, 'manage_truckPost_alert');
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('manage_truckPost_alert');

                        // call $anchorScroll()
                        $anchorScroll();
                        //$scope.messageAvailable = true;
                        //$scope.index.messageAvailable = true;
                        //succesError(data.statusMsg, 'indexTruckListMessage');
                        //succesError("Login failed", 'login_alert');
                    });
            }else if($scope.editTruckPostInd){
                $http.post("/TransEarth/editTruckPost", {
                    truckId : $scope.truckToPost._id,
                    post : $scope.truckToPost.post
                })
                    .success(function(data) {
                        console.log("Truck Post saved successfully");
                        $scope.truckPostProcess.indicator.saved = true;
                        $scope.truckPost = {};
                        $scope.truckPostProcess.indicator.showAlert = true;
                        TruckPostRequest.setSharedTruck(null);
                        $scope.truckPostToUpdate = null;
                        $scope.truckToPost = null;
                        succesAlert("Truck Post updated successfully", 'truck_home_alert');
                        $scope.truckOwnerPage.showPostList = true;
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('headerBar');

                        // call $anchorScroll()
                        $anchorScroll();
                    }).error(function(err) {
                        console.log("Truck Post update failed:"+JSON.stringify(err));
                        $scope.truckPostProcess.indicator.saved = false;
                        $scope.truckPostProcess.indicator.showAlert = true;
                        succesError(JSON.stringify(err), 'manage_truck_post_alert');
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('truckPostManagePage');

                        // call $anchorScroll()
                        $anchorScroll();
                        //$scope.messageAvailable = true;
                        //$scope.index.messageAvailable = true;
                        //succesError(data.statusMsg, 'indexTruckListMessage');
                        //succesError("Login failed", 'login_alert');
                    });
            }
        }else {
            //alert("Please correct errors!");
            $scope.truckPostProcess.indicator.showAlert = true;
            succesWarning("Please correct the errors on Truck Post", 'manage_truck_post_alert');
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('truckPostManagePage');

            // call $anchorScroll()
            $anchorScroll();
        }
    };
}
