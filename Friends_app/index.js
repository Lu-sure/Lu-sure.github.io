class FriendsSearchPage {
    constructor() {
        this.searchForm = document.getElementById('search-form');
        this.sortUpButton = document.getElementById('sort-up');
        this.sortDownButton = document.getElementById('sort-down');

        this.sortBy = '';
        this.initSortDirection = 'up';
        this.reverseSortDirection = 'down';
        this.sortDirection = '';
        this.initFilterGenderValue = 'all';
        this.filterGenderValue = this.initFilterGenderValue;
        this.searchedName = '';

        this.users = [];

        this.fetchUsers();
    }

    handleFetchErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    fetchUsers() {
        const url = `https://randomuser.me/api/?results=100&inc=gender,name,phone,dob,picture`;
        return fetch(url)
            .then(this.handleFetchErrors)
            .then((response) => response.json())
            .then((responseJson) => {
                responseJson.results.forEach((userInfo) => {
                    this.users.push(new User(userInfo));
                });
                this.initSearchPage();
            })
            .catch((error) => console.log(error));
    }

    initSearchPage() {
        this.renderUsers(this.users);
        this.renderSearchedUsers();
        this.handleReset();
    }

    renderUsers(users) {
        const searchResultWrapper = document.getElementById('search-results');

        searchResultWrapper.innerHTML = '';

        const usersHtmlSet = document.createDocumentFragment();
        users.forEach((user) => {
            const userCard = new UserCard(user);
            usersHtmlSet.appendChild(userCard.getHtml());
        });

        searchResultWrapper.appendChild(usersHtmlSet);
    }

    searchByName(users) {
        return this.searchedName === ''
            ? users
            : users.filter(
                  (user) =>
                      user.firstName
                          .toLowerCase()
                          .startsWith(this.searchedName.toLowerCase()) ||
                      user.lastName
                          .toLowerCase()
                          .startsWith(this.searchedName.toLowerCase())
              );
    }

    sortUsers(users) {
        const sortedUsers = [...users];

        sortedUsers.sort(
            function (previousUser, nextUser) {
                let propOfPreviousUser = previousUser[this.sortBy];
                let propOfNextUser = nextUser[this.sortBy];
                if (typeof propOfPreviousUser === 'string') {
                    propOfPreviousUser.toLowerCase();
                    propOfNextUser.toLowerCase();
                }
                return propOfPreviousUser < propOfNextUser ? -1 : 1;
            }.bind(this)
        );

        return this.sortDirection === this.reverseSortDirection
            ? users.reverse()
            : users;
    }

    filterByGender(users) {
        return this.filterGenderValue === this.initFilterGenderValue
            ? users
            : users.filter((user) => user.gender === this.filterGenderValue);
    }

    getSearchedSetOfUsers() {
        let set = this.users;
        set = this.filterByGender(set);
        set = this.sortUsers(set);
        set = this.searchByName(set);
        return set;
    }

    handleSearchParams(target) {
        const inputs = {
            'sort-type': () => {
                this.sortBy = target.value;
                this.sortUpButton.disabled = false;
                this.sortDownButton.disabled = false;
                this.sortUpButton.checked = true;
                this.sortDirection = this.initSortDirection;
            },
            'sort-direction': () => {
                this.sortDirection = target.value;
            },
            gender: () => {
                this.filterGenderValue = target.value;
            },
            'searched-name': () => {
                this.searchedName = target.value;
            },
        };

        if (inputs[target.name]) {
            inputs[target.name]();
        }
    }

    renderSearchedUsers() {
        this.searchForm.addEventListener(
            'input',
            function (event) {
                this.handleSearchParams(event.target);
                this.renderUsers(this.getSearchedSetOfUsers());
            }.bind(this)
        );
    }

    handleReset() {
        this.searchForm.addEventListener(
            'reset',
            function () {
                this.searchForm.reset;
                this.sortBy = '';
                this.filterGenderValue = this.initFilterGenderValue;
                this.sortDirection = '';
                this.sortUpButton.disabled = true;
                this.sortDownButton.disabled = true;
                this.renderUsers(this.users);
            }.bind(this)
        );
    }
}

class User {
    constructor(user) {
        this.firstName = user.name.first;
        this.lastName = user.name.last;
        this.age = user.dob.age;
        this.phone = user.phone;
        this.gender = user.gender;
        this.picture = user.picture.medium;
    }
}

class UserCard {
    constructor(user) {
        this.user = user;
    }

    getHtml() {
        const container = document.createElement('div');
        container.classList.add('friend-card');
        container.innerHTML = `<h3 class="user-name">
                <a href="#">${this.user.firstName} ${this.user.lastName}</a>
            </h3>
            <img src="${this.user.picture}" alt="" class="user-pic">
            <span class="user-info">${this.user.age} years old</span>
            <span class="user-info">${this.user.gender}</span>
            <a href="tel:${this.user.phone
                .split(/\W*/)
                .join('')}" class="user-info">${this.user.phone}</a>`;
        return container;
    }
}

const mySearchPage = new FriendsSearchPage();
