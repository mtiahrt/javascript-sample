"use strict";
function ProjectComponent(){
    this.projectDiv = document.createElement('div');
    this.projectDropdown = document.createElement('div');
    this.projectRows = [];
}
ProjectComponent.prototype.createProjectDiv = function(){
    this.projectDiv.classList.add('project');
    const projectsTable = document.createElement('table');
    const tableHeader = document.createElement('thead');
    projectsTable.appendChild(tableHeader);
    const headerRow = document.createElement('tr');
    const projectHeaderColumn = document.createElement('th');
    projectHeaderColumn.textContent = 'Project';
    const roleHeaderColumn = document.createElement('th');
    roleHeaderColumn.textContent = 'Role';
    headerRow.appendChild(projectHeaderColumn);
    headerRow.appendChild(roleHeaderColumn);
    tableHeader.appendChild(headerRow);
    const tableBody = document.createElement('tbody');
    tableBody.classList.add('selected-projects','enabled');
    projectsTable.appendChild(tableBody);
    const projectPlus = document.createElement('i');
    projectPlus.classList.add('fa','fa-plus-circle','fa-lg','project-plus');
    projectPlus.id = 'projectPlusButton';
    projectPlus.setAttribute('data-toggle','dropdown');
    projectPlus.setAttribute('aria-haspopup','true');
    projectPlus.setAttribute('aria-expanded','false');
    projectPlus.textContent = 'Project';
    projectPlus.onclick = handleProjectPlusDropdownClickEvent;
    this.projectDropdown.classList.add('dropdown-menu','project-dropdown');
    this.projectDropdown.setAttribute('aria-labelledby',"projectPlusButton");
    this.projectDropdown.onclick = handleProjectPlusDropdownClickEvent;

    this.projectDiv.appendChild(projectsTable);
    this.projectDiv.appendChild(projectPlus);
    this.projectDiv.appendChild(this.projectDropdown);
    return this.projectDiv;
}
ProjectComponent.prototype.createSelectedProjectsTR = function (name, id){
    const projectRow = document.createElement('tr');
    projectRow.setAttribute('project-id', id);
    projectRow.classList.add('new-row');
    const projectNameColumn = document.createElement('td'); 
    projectNameColumn.classList.add('project-name');
    projectNameColumn.textContent = name;
    const selectColumn = document.createElement('td');
    const selectElement = document.createElement('select');
    selectElement.options.add(createLoadingOption());
    
    selectColumn.appendChild(selectElement);
    const minusButton = document.createElement('i');
    minusButton.onclick = handleProjectMinusClickEvent;
    minusButton.classList.add('fa','fa-minus-circle','fa-lg','project-minus');
    const minusColumn = document.createElement('td');
    minusColumn.appendChild(minusButton);
    //add to the row
    projectRow.appendChild(projectNameColumn);
    projectRow.appendChild(selectColumn)
    projectRow.appendChild(minusColumn);
    this.projectRows.push(projectRow);
    return projectRow;
}
ProjectComponent.prototype.loadComponent = function(data, exclude){
    if(data && data.length > 0 && data[0].workspaces){
        if(exclude){
            const filterdOptions = data[0].workspaces.data.filter(workspace => !exclude.includes(workspace.id))
            data[0].workspaces.data = filterdOptions;
        }
        this.loadProjectDropdown(data.shift());
        //loop the roles. and load them
        if(data.length === this.projectRows.length){
            data.forEach((item, index) => {
                this.loadProjectRow(item, this.projectRows[index]);
            });
        }
    }
}
ProjectComponent.prototype.loadProjectDropdown = function({workspaces}){
    workspaces.data.forEach(workspace => {
        const child = document.createElement('a');
        child.classList.add('dropdown-item');
        child.setAttribute('data-id', workspace.id);
        child.textContent = workspace.name;
        this.projectDropdown.appendChild(child);
    });
}
ProjectComponent.prototype.loadProjectRow = function(data, row){
    const selectElement = row.querySelector('select');
    populateSelectElement(data.roles.data, selectElement, 'displayName');
}
ProjectComponent.prototype.removeProjectDropdown = function (dropdownItems, id) {
    //const dropdownItems = this.clientProjectSelections.querySelectorAll('.project .project-dropdown a');
    const dropdownItem = [...dropdownItems].find(item => item.id === id);
    if(dropdownItem){
        dropdownItem.remove()
    }
}
