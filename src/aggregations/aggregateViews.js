'use strict'

const { subDays, subMonths, subYears, startOfDay, startOfMonth, startOfYear } = require('date-fns')

const intervals = require('../constants/intervals')
const matchDomainId = require('../stages/matchDomainId')

module.exports = (id, unique, interval) => {

	const aggregation = [
		matchDomainId(id),
		{
			$group: {
				_id: {},
				count: {
					$sum: 1
				}
			}
		},
		{
			$sort: {
				'_id.year': -1,
				'_id.month': -1,
				'_id.day': -1
			}
		}
	]

	if (unique === true) aggregation[0].$match.clientId = {
		$exists: true,
		$ne: null
	}

	if (interval === intervals.INTERVALS_DAILY) {
		aggregation[0].$match.created = { $gte: subDays(startOfDay(new Date()), 13) }
		aggregation[1].$group._id.day = { $dayOfMonth: '$created' }
		aggregation[1].$group._id.month = { $month: '$created' }
		aggregation[1].$group._id.year = { $year: '$created' }
	}

	if (interval === intervals.INTERVALS_MONTHLY) {
		aggregation[0].$match.created = { $gte: subMonths(startOfMonth(new Date()), 13) }
		aggregation[1].$group._id.month = { $month: '$created' }
		aggregation[1].$group._id.year = { $year: '$created' }
	}

	if (interval === intervals.INTERVALS_YEARLY) {
		aggregation[0].$match.created = { $gte: subYears(startOfYear(new Date()), 13) }
		aggregation[1].$group._id.year = { $year: '$created' }
	}

	return aggregation

}