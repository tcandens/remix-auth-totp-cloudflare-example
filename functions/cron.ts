export default {
  async scheduled(event, evn, ctx) {
    switch (event.cron) {
      case '* * * * *':
        console.log('running scheduled!')
        break;
      default:
        console.log('fallthrough crontab!')
    }
  }
}
