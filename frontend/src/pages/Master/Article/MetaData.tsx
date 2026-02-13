type MetadataType = 'String' | 'Date' | 'Image' | 'Number' | 'Enum' | 'Day' | 'Multiselect' | 'TrueFalse' | 'Time'
interface MetadataField {
    type: MetadataType
    options?: string[],
    tooltip?: string
}

export type MetaDataCategory = Record<string, MetadataField>
type MetaDataMapType = Record<string, MetaDataCategory>

export const METADATA_TYPE = {
    STRING: 'String' as const,
    DATE: 'Date' as const,
    IMAGE: 'Image' as const,
    NUMBER: 'Number' as const,
    ENUM: 'Enum' as const,
    DAY: 'Day' as const,
    MULTISELECT: 'Multiselect' as const,
    TRUE_FALSE: 'TrueFalse' as const,
    TIME: 'Time' as const
}

export const MetaDataMap: MetaDataMapType = {
    'events': {
        start_date: {type: METADATA_TYPE.DATE},
        end_date: {type: METADATA_TYPE.DATE},
        multi_day: {type: METADATA_TYPE.MULTISELECT, options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']},
        // start_end_date: {}
        start_time: {type: METADATA_TYPE.TIME},
        end_time: {type: METADATA_TYPE.TIME},
        whole_day: {type: METADATA_TYPE.TRUE_FALSE},
        price: {type: METADATA_TYPE.NUMBER, tooltip: 'put 0 for free'},
        external_url: {type: METADATA_TYPE.STRING},
    },
    "housing": {
        Location: {type: METADATA_TYPE.STRING},
        company_logo: {type: METADATA_TYPE.IMAGE},
        company_name: {type: METADATA_TYPE.STRING},
        price: {type: METADATA_TYPE.NUMBER},
        currency: {type: METADATA_TYPE.ENUM, options: ["USD", "SGD", "IDR"]},
        property_type: {type: METADATA_TYPE.STRING},
        status: {type: METADATA_TYPE.ENUM, options: ["For Sale", "For Rent", "Sold Out"]},
        rentaltype: {type: METADATA_TYPE.ENUM, options: ["daily", "monthly", "yearly"]}
    },
    "job-listing": {
        company_name: {type: METADATA_TYPE.STRING},
        company_logo: {type: METADATA_TYPE.IMAGE},
        company_location: {type: METADATA_TYPE.STRING},
        company_email: {type: METADATA_TYPE.STRING, tooltip: 'This will use for automatic email if user send their cv and email ... if no email provided input field for user will disable'},
        job_type: {type: METADATA_TYPE.ENUM, options: ['Fulltime', 'Part-Time', "Internship", "Freelance"]},
        salary_range: {type: METADATA_TYPE.NUMBER, tooltip: 'input only the amount, use field below for currency and whether salary per hour, month or year'},
        salary_time: {type: METADATA_TYPE.ENUM, options: ['hour', 'month', 'year']},
        salary_currency: {type: METADATA_TYPE.STRING, tooltip: 'use 3 digit letter example = USD IDR SGD'},
        experience: {type: METADATA_TYPE.NUMBER},
    },
    "deals": {
        multi_day: {type: METADATA_TYPE.MULTISELECT, options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']},
        start_date: {type: METADATA_TYPE.DATE},
        end_date: {type: METADATA_TYPE.DATE},
    }
}