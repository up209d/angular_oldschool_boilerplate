const {
  configure,
  observable,
  action,
  flow,
  computed,
  decorate,
  runInAction
} = mobx;

const dataService = function($rootScope,$state,$timeout,$q,$http) {
  configure({
    enforceActions: true
  });
  class DataService {
    @observable state = {};

    @action fetchData = () => {
      const defer = $q.defer();
      const request = $http({
        method: 'GET',
        url: 'data/data.json',
        cache: true,
        params: {
          build: window._BUILD_
        }
      }).then(
        res => {
          runInAction(()=>{
            this.state = res.data;
          });
          defer.resolve(res);
        } ,
        err => {
          defer.reject(err);
        }
      );
      return defer.promise;
    };

    @action requestData = async () => {
      const response = await $http({
        method: 'GET',
        url: 'data/data.json',
        cache: true,
        params: {
          build: window._BUILD_
        }
      });
      runInAction(()=>{
        this.state = response.data;
      });
    };

    generateData = flow(function*() {
      const response = yield $http({
        method: 'GET',
        url: 'data/data.json',
        cache: true,
        params: {
          build: window._BUILD_
        }
      });
      this.state = response.data;
    });

    @action test = () => {
      this.state = Math.random();
    };

    @computed get checkIsTested() {
      return !!this.state.isTested;
    };
  };

  return new DataService();
};

dataService.$inject = ['$rootScope','$state','$timeout','$q','$http'];

export default dataService;
