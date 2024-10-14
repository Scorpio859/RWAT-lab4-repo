//getting the buttons
const syncXHR = document.getElementById('syncXHR');
const asyncXHR = document.getElementById('asyncXHR');
const fetching = document.getElementById('fetch');

//XLHttpRequest used synchronously
syncXHR.addEventListener('click', () => {

    let data = [];
    const request = new XMLHttpRequest();

    try {
        //opening known reference.json file and setting async to false
        request.open("GET", "data/reference.json", false);
        request.send();
        //parse the data and store it
        let referenceData = JSON.parse(request.responseText);

        //while ref Data has a data location
        while (referenceData.data_location) {
            //create a request using that datalocation
            request.open("GET", `data/${referenceData.data_location}`, false);
            request.send();
            //parse the data and store it
            const fileData = JSON.parse(request.responseText);
            //concatinate the files data into our data array
            data = data.concat(fileData.data);
            //assign the files data to be the new refernce data
            referenceData = fileData;
        }

        //no data location to get to data3 so have to manually add it
        request.open("GET", `data/data3.json`, false);
        request.send();

        //parse the data and store it
        const data3 = JSON.parse(request.responseText);
        //concatinate data onto our list
        data = data.concat(data3.data);


    } catch(error) {
        console.error("Couldn't fetch data via synchronous XMLHttpRequest", error);
    }

    //display the data in the table
    displayData(data);
});

//XMLHttpRequest used Asynchronousy
asyncXHR.addEventListener('click', () => {
    
    let data = [];
    
    function getNextFile(filePath) {
        const request = new XMLHttpRequest();
        //get data from file using filepath, true to ensure asynchronous
        request.open("GET", `data/${filePath}`, true);
        //wait for the ready state to change
        request.onreadystatechange = function() {
            //check if state is 4(complete) and status is 200()
            if (request.readyState === 4 && request.status === 200) {
                //parse response for data
                const fileData = JSON.parse(request.responseText);
                //concatinate it onto our data array
                data = data.concat(fileData.data);
                
                //if file had data location recall function
                if (fileData.data_location) {
                    getNextFile(fileData.data_location);
                } else {
                    //no more data location so can now read in data 3 manually
                    const request3 = new XMLHttpRequest();
                    request3.open("GET", "data/data3.json", true);
                    request3.onreadystatechange = function () {
                        if (request3.readyState === 4 && request3.status === 200) {
                            const data3 = JSON.parse(request3.responseText);
                            data = data.concat(data3.data);
                            
                            //all data has been loaded so call display function
                            displayData(data);
                        }
                    };
                    request3.send();
                }
            }
        };
        request.send();
    }
    
    //start function by calling with the reference json
    getNextFile("reference.json");
});

//fetch with promises
fetching.addEventListener('click', async () => {

    let data = [];
    let file = "reference.json";

    while (file) {
        try {
            //fetch the current file and store in response
            const response = await fetch(`data/${file}`);
            //get data by converting response to json
            const fileData = await response.json();

            //concatinate the files data to data array
            data = data.concat(fileData.data);

            //next file is retrieved from current file's data location (if it has it)
            file = fileData.data_location || null;
        } catch (error) {
            console.error("Error getting data:", error);
            break;
        }
    }

    //now out of while loop means other data has been retrieved so now add data3
    try {
        //same as before but for data3
        const response = await fetch("data/data3.json");
        const data3 = await response.json();

        data = data.concat(data3.data);

    } catch (error) {
        console.error("Error fetching data3.json", error);
    }

    //display all the data
    displayData(data);
});

//function for taking in data array and formatting and displaying it on the HTML table
function displayData(data) {
    //get the tbody of the data table
    const tbody = document.querySelector('#dataTable tbody');
    //make tbody nothing to clear table
    tbody.innerHTML = "";
    //for each student in the data
    data.forEach(student => {
        //check if student and student name exist
        if (student && student.name) {
            //split the name into first and last
            const [Fname, Lname] = student.name.split(" ");
            //create a row to store the data in
            const row = document.createElement("tr");
            //assign data to the row
            row.innerHTML = `<td>${Fname}</td><td>${Lname}</td><td>${student.id}</td>`;
            //append it to the tbody
            tbody.appendChild(row);
        } else {
            //print error
            console.error("Student or Student.name don't exist:", student);
        }
    });
}


