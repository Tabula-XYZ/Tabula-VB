export type T_PAYLOAD_ACTION = IAskContextPayload | IPostTweetPayload | IAskUserProfilePayload | IFollowMassPayload | 
IUnFollowMassPayload | IAskTweetPayload | IAskTweetsBatchsPayload | IAskContextConfirmationPayload | IPostTweetReplyPayload | IAskFBPostCommentPayload | IAskRTTweetPayload | IAskUnRTTweetPayload | IAskFBPageProfilePayload | IPostFBPagePostPayload

export type T_PAYLOAD_RECEPTION = IErrorPayload | IReceiveContextPayload | IReceiveUserProfilePayload | IReceiveFBPageProfilePayload | 
IReceiveAPIAccountPayload | IReceiveTweetsPayload | IReceiveUnfollowMassReport | 
IReceiveFollowMassReport | IReceiveTweetBatchesReport  | IReceiveRTTweetConfirmationPayload | IReceiveUnRTTweetConfirmationPayload

export type T_TYPE_ACTION = "ask_context" | 'ask_context_confirmation' | "post_tweet" | "ask_user_profile" | 'follow_mass' | 'unfollow_mass' | 'ask_tweet' | 'ask_tweet_batchs' | 'post_tweet_reply' | 'ask_fb_post_comment' | 'ask_rt_tweet' | 'ask_unrt_tweet' | "ask_fb_page_profile" | 'post_fb_page_post'

export type T_TYPE_RECEPTION = 'error' | "receive_context" |  "receive_user_profile" | "receive_tweets" | 
'receive_unfollowmass_report' | 'receive_followmass_report' | 'receive_tweet_batchs_report' | 'receive_context_confirmation' | 'receive_rt_tweet_confirmation' | 'receive_unrt_tweet_confirmation' | 'receive_fb_page_profile'

export type T_REQUEST_ID = `${T_TYPE_ACTION}-${string}-${string}-${SOCIAL}`

export type TTwitterContentType = 'user' | 'leech'
export type TPick = 'random' | 'oldest' | 'newest'
export type SOCIAL = 'twitter' | 'instagram' | 'facebook'
export type TTaskCronable = 'post_tweet' | 'follow_mass' | 'unfollow_mass' | 'post_fb_page_post'
export type TSubTaskCronbablePostTweet = 'tweet' | 'thread'
export type TReplyTrigger = '1H' | '2H' | '4H' | '6H' | '12H' | '24H'

export const ReplyTriggerList: TReplyTrigger[] = ['1H', '2H', '4H', '6H', '12H', '24H']

export type TNotifType = 'error' | 'success' | 'warning' | 'info'

export interface IAction {
    type: T_TYPE_ACTION
    payload: T_PAYLOAD_ACTION
    social: SOCIAL
    request_id: T_REQUEST_ID //request id (not unique, but give request extra data)
    fingerprint: string //browser fingerprint
    proxy: IProxy | null //proxy usable
    time: number //action creation time in milliseconds, sufficiently precise to be unique and to be used as a key
    priority: number //priority of the action, 0 is the highest priority
}

export interface IReception {
    type: T_TYPE_RECEPTION
    payload: T_PAYLOAD_RECEPTION
    social: SOCIAL
    request_id: T_REQUEST_ID
    action_time: number
}

export interface IAskRTTweetPayload {
    tweet_id: string
    username: string
    context: string
}

export interface IAskUnRTTweetPayload {
    tweet_id: string
    username: string
    context: string
}

//payload
export interface IAskContextPayload {
    username: string
    phoneOrEmail: string
    password: string
}

//payload
export interface IAskContextConfirmationPayload {
    context: string
}

export interface IAskTweetPayload {
    username: string
    tweet_id: string
    context: string
}

export interface IAskTweetsBatchsPayload {
    username: string
    context: string
    limit?: number
    until_max?: Date
}

export interface IUnFollowMassPayload {
    username: string
    context: string
    do_unfollow_ids: string[]
}

export interface IFollowMassPayload {
    username_to_follow: string
    settings: IFollowMassSettings
    context: string
    dont_follow_ids: string[]
}

export interface IPostTweetReplyPayload {
    tweet: ITweetPosting
    username: string
    tweet_id: string
    context: string
}

export interface IAskFBPostCommentPayload {
    text: string
    context: string
}

export interface IPostTweetPayload {
    tweets: ITweetPosting[]
    context: string
}

export interface IAskUserProfilePayload {
    username: string
    context: string
}

export interface IAskFBPageProfilePayload {
    username: string
    context: string
    user_id: number //used for identification on callback
}

export interface IPostFBPagePostPayload{
    username: string
    post: ITweetPosting
    context: string
    comment?: string
}

/*          get             */
export interface IReceiveContextPayload {
    username: string
    context: string
}


export interface IReceiveAPIAccountPayload {
    callback_url: string
    token: string
    expiration: Date
}

export interface IErrorPayload {
    origin: T_TYPE_ACTION
    text: string
}

export interface IReceiveUnfollowMassReport {
    ids: string[]
    fback_ids: string[]
    error: string
}

export interface IReceiveFBPageProfilePayload { 
    username: string
    name: string
    likes_count: number
    followers_count: number
    posts: IFBPost[]
    is_admin: boolean
    pp: string
}

export interface IFBPost {
    text: string
    reaction_count: number
    comments_count: number
    share_count: number
    medias: string[]
    time: number
    id: string
}

export interface IReceiveFollowMassReport {
    ids: string[]
    follower_of: string
    error: string
}

export interface IReceiveTweetBatchesReport {
    username: string
    count: number
    has_stopped_limit: boolean
    has_stopped_error: boolean
    has_stopped_date: boolean
}

export interface IReceiveUserProfilePayload {
    username?: string
    timeline?: ITwitterTimeline
    name?: string
    created_at?: Date
    followers_count?: number
    following_count?: number
    likes_count?: number
    media_count?: number
    tweets_count?: number
    pp?: string
    id?: string
    is_restricted?: boolean
}

export interface IReceiveRTTweetConfirmationPayload {
    tweet_id: string
    username: string
}

export interface IReceiveUnRTTweetConfirmationPayload {
    tweet_id: string
    username: string
}

export interface IReceiveTweetsPayload {
    timeline: ITwitterTimeline
}

//action types
/*          post             */
export const ASK_CONTEXT: T_TYPE_ACTION = "ask_context"
export const ASK_USER_PROFILE: T_TYPE_ACTION = "ask_user_profile"
export const POST_TWEET: T_TYPE_ACTION = "post_tweet"
export const FOLLOW_MASS: T_TYPE_ACTION = 'follow_mass'
export const UNFOLLOW_MASS: T_TYPE_ACTION = 'unfollow_mass'
export const ASK_FB_POST_COMMENT: T_TYPE_ACTION = 'ask_fb_post_comment'
export const ASK_TWEET: T_TYPE_ACTION = 'ask_tweet'
export const ASK_TWEETS_BATCH: T_TYPE_ACTION = 'ask_tweet_batchs'
export const ASK_CONTEXT_CONFIRMATION: T_TYPE_ACTION = 'ask_context_confirmation' 
export const POST_TWEET_REPLY: T_TYPE_ACTION = 'post_tweet_reply'
export const ASK_RT_TWEET: T_TYPE_ACTION = 'ask_rt_tweet'
export const ASK_UNRT_TWEET: T_TYPE_ACTION = 'ask_unrt_tweet'
export const ASK_FB_PAGE_PROFILE: T_TYPE_ACTION = 'ask_fb_page_profile'
export const POST_FB_PAGE_POST: T_TYPE_ACTION = 'post_fb_page_post'

/*          get             */
export const RECEIVE_USER_PROFILE: T_TYPE_RECEPTION = "receive_user_profile"
export const RECEIVE_CONTEXT: T_TYPE_RECEPTION = "receive_context"
export const RECEIVE_TWEETS: T_TYPE_RECEPTION = "receive_tweets"
export const ERROR: T_TYPE_RECEPTION = "error"
export const RECEIVE_UNFOLLOWMASS_REPORT: T_TYPE_RECEPTION = 'receive_unfollowmass_report'
export const RECEIVE_FOLLOWMASS_REPORT: T_TYPE_RECEPTION = 'receive_followmass_report'
export const RECEIVE_TWEETS_BATCHS_REPORT: T_TYPE_RECEPTION = 'receive_tweet_batchs_report'
export const RECEIVE_CONTEXT_CONFIRMATION: T_TYPE_RECEPTION = 'receive_context_confirmation'
export const RECEIVE_RT_TWEET_CONFIRMATION: T_TYPE_RECEPTION = 'receive_rt_tweet_confirmation'
export const RECEIVE_UNRT_TWEET_CONFIRMATION: T_TYPE_RECEPTION = 'receive_unrt_tweet_confirmation'
export const RECEIVE_FB_PAGE_PROFILE: T_TYPE_RECEPTION = 'receive_fb_page_profile'

export interface IAccountPosting {
    invitation_code: string
    email: string
    password: string
    client: IClient
}

export interface IClient {
    user_agent: string
    platform: string
    screen_width: number
    screen_height: number
    lang: string
    timezone_offset: number
}

export interface ITwitterMediaPosting {
    urls: string[]
}

export interface IContentPosting {
    text: string
    conversation_id: number
    medias: number[]
    reply: string
    similar_auto_rm?: boolean
}

export interface IReplyPosting {
    text: string
    media_ids: number[]
}

export interface ISocialPosting {
    social: SOCIAL, 
    username: string, 
    password: string,
    phone_or_email: string
    fingerprint_id: number
}

export interface ISocialPostingWithContext {
    context: string
    fingerprint_id: number
}

export interface IBucketPutting {
    pick_by?: TPick, 
    enable_leeching?: boolean
    leeching_strategy?: TFollowMassStrategy | null
    blacklisted_words?: string[]
    muse_allowed?: boolean,
    reply_trigger?: Partial<{[key in TReplyTrigger]: number}>;
    self_rt_config?: ISelfRTConfig
}

export interface IMembershipPutting {
    will_rt: boolean
    will_be_rt: boolean
}

export interface ICronPosting {
    cron: string
    sub_task: TSubTaskCronbablePostTweet | null
    task: 'post_tweet' | 'post_fb_page_post'
}

export interface ITweetPosting {
    text?: string
    medias?: string[]
    noUrlPreview?: boolean
}

export interface ILeechPosting {
    username: string
    social: SOCIAL
}

export interface IGroupPosting {
    name: string
    count_rt_day: number
    config: ISelfRTConfig
}

export interface IReport {
    at: number
    followed: number
    followed_back: number
    unfollowed: number
    batch: number
}

export interface ILeechPerf {
    username: string
    score: number
    n: number
    batch: number
    consistency: number
    last: IReport
}

export interface ILeechState {
    username: string
    last_call: IReport | null
    last_reports_daily: (IReport | null)[]
    last_reports_2_hourly: (IReport | null)[]
    total: IReport
}

export interface ISelfRTConfig {
    min_views: number
    from_daily_minute: number
    to_daily_minute: number
}


export interface IFollowersEvolution {
    three_days?: number[] 
    month?: number[]
    quarter?: number[]
}

export interface IAppStatus {
    last_scraper_status: IScraperStats | null,
    queue_status: {
        size: number,
        connected: boolean
    },
    scrapping_muse_count: number,
}

export interface IScraperStats {
    max_capacity: number
    count_processing: number
    count_waiting: number
    time: number
}

export interface IProxy {
    ip: string
    port: number
    username: string
    password: string
}

export interface IFingerprintData {
    fingerprint: {
      screen: {
        availHeight: number;
        availWidth: number;
        pixelDepth: number;
        height: number;
        width: number;
        availTop: number;
        availLeft: number;
        colorDepth: number;
        innerHeight: number;
        outerHeight: number;
        outerWidth: number;
        innerWidth: number;
        screenX: number;
        pageXOffset: number;
        pageYOffset: number;
        devicePixelRatio: number;
        clientWidth: number;
        clientHeight: number;
        hasHDR: boolean;
      };
      navigator: {
        userAgent: string;
        userAgentData: any;
        language: string;
        languages: string[];
        platform: string;
        deviceMemory: number;
        hardwareConcurrency: number;
        maxTouchPoints: number;
        product: string;
        productSub: string;
        vendor: string;
        vendorSub: string | null;
        doNotTrack: string | null;
        appCodeName: string;
        appName: string;
        appVersion: string;
        oscpu: string | null;
        extraProperties: any;
        webdriver: boolean;
      };
      audioCodecs: {
        ogg: string;
        mp3: string;
        wav: string;
        m4a: string;
        aac: string;
      };
      videoCodecs: {
        ogg: string;
        h264: string;
        webm: string;
      };
      pluginsData: {
        plugins: any[];
        mimeTypes: any[];
      };
      battery: {
        charging: boolean;
        chargingTime: number;
        dischargingTime: number | null;
        level: number;
      };
      videoCard: {
        vendor: string;
        renderer: string;
      };
      multimediaDevices: {
        speakers: any[];
        micros: any[];
        webcams: any[];
      };
      fonts: string[];
    };
    headers: {
      'sec-ch-ua': string;
      'sec-ch-ua-mobile': string;
      'sec-ch-ua-platform': string;
      'upgrade-insecure-requests': string;
      'user-agent': string;
      accept: string;
      'sec-fetch-site': string;
      'sec-fetch-mode': string;
      'sec-fetch-user': string;
      'sec-fetch-dest': string;
      'accept-encoding': string;
      'accept-language': string;
    };
  }

export interface ITweetMedia {
    video_url: string
    type: 'photo' | 'video' | 'animated_gif' 
    picture_url: string
    video_duration_ms: number
}

export interface ITweetPollChoice {
    label: string
    value: number
}

export interface ITweetPoll {
    end_datetime: Date
    choices: ITweetPollChoice[]
}

export interface ITweetParsed {
    id: string
    user_id: string
    views_count: number
    created_at: Date
    favorite_count: number
    favorited: boolean
    retweet_count: number
    retweeted: boolean
    quote_count: number
    reply_count: number
    conversation_id: string
    bookmark_count: number
    bookmarked: boolean
    text: string
    lang: string

    has_url: boolean
    has_url_preview: boolean
    has_mentions: boolean
    has_symbols: boolean

    is_a_retweet: boolean
    is_translatable: boolean
    is_quote_status: boolean
    is_in_thread: boolean
    media?: ITweetMedia[]
    poll?: ITweetPoll
    quote?: ITweetParsed | string
}

export interface ITwitterAccountSettings {
  protected: boolean;
  screen_name: string;
  always_use_https: boolean;
  use_cookie_personalization: boolean;
  sleep_time: {
    enabled: boolean;
    end_time: null | string;
    start_time: null | string;
  };
  geo_enabled: boolean;
  language: string;
  discoverable_by_email: boolean;
  discoverable_by_mobile_phone: boolean;
  display_sensitive_media: boolean;
  personalized_trends: boolean;
  allow_media_tagging: "all";
  allow_contributor_request: "none";
  allow_ads_personalization: boolean;
  allow_logged_out_device_personalization: boolean;
  allow_location_history_personalization: boolean;
  allow_sharing_data_for_third_party_personalization: boolean;
  allow_dms_from: "following" | "everyone" | "none";
  allow_dm_groups_from: "following" | "everyone" | "none";
  translator_type: "none" | "regular" | "geo" | "none_translator";
  country_code: string;
  nsfw_user: boolean;
  nsfw_admin: boolean;
  ranked_timeline_setting: null | string;
  ranked_timeline_eligible: null | string;
  address_book_live_sync_enabled: boolean;
  universal_quality_filtering_enabled: "enabled" | "disabled";
  dm_receipt_setting: "all_enabled" | "none_enabled" | "all_disabled";
  alt_text_compose_enabled: null | string;
  mention_filter: "unfiltered" | "mentions" | "all";
  allow_authenticated_periscope_requests: boolean;
  protect_password_reset: boolean;
  require_password_login: boolean;
  requires_login_verification: boolean;
  ext_sharing_audiospaces_listening_data_with_followers: boolean;
  ext: {
    ssoConnections: {
      r: {
        ok: any[];
      };
      ttl: number;
    };
  };
  dm_quality_filter: "enabled" | "disabled";
  autoplay_disabled: boolean;
  settings_metadata: {
    is_eu: "true" | "false";
  };
}

export interface ITweetLongThread {
    ids: string[]
    introduction: ITweetParsed
}

export interface ITwitterTimeline {
    long_threads: ITweetLongThread[]
    short_threads: ITweetParsed[][]
    tweets: ITweetParsed[]
}

export interface IFollowMassSettings { 
    maxRatioFollowers: number, //10
    minRatioFollowers: number // 0.2 friends_count / followers_count
    minFollowers?: number, //40 //followers_count
    minActivityPerWeek?: number, //2 statuses_count
    mustHaveDescription?: boolean, //description
    mustHavePP?: boolean //default_profile_image = false
    limit: number
    accountCreatedAfter?: Date //created_at
    individualOnly?: boolean
}

export interface IFollowMassCandidate {
    id: string //
    follower_of: string //
    created_at: Date
    default_profile_image: boolean
    description: string,
    followed_by: boolean
    tweets_count: number
    followers_count: number
    likes_count: number
    is_protected: boolean
    following_count: number
    username: string
    is_sensitive: boolean
    is_restricted: boolean
    can_dm: boolean
    is_business: boolean
    has_link: boolean
}

export type TFollowMassStrategy = 'lv1' | 'lv2' | 'lv3' | 'lv4'

export interface IFollowMassStrategy {
    settings: IFollowMassSettings

    cooldownBetweenBatches: number //internal value
    maxBatchPerDay: number
    minLeechCount: number
    minFollowersCount: number
    dailyFollowingLimit: number
}

export const STRATEGY_LV1: IFollowMassStrategy = {
    settings: {
        maxRatioFollowers: 1.2,
        minRatioFollowers: 0.05,
        minFollowers: 5,
        minActivityPerWeek: 15,
        limit: 9,
        accountCreatedAfter: new Date(2019, 1, 1),
        individualOnly: true,
    },
    maxBatchPerDay: 8,
    cooldownBetweenBatches: 7_200 * 1000, //2h
    minLeechCount: 5,
    minFollowersCount: 0,
    dailyFollowingLimit: 50
}

export const STRATEGY_LV2: IFollowMassStrategy = {
    settings: {
        maxRatioFollowers: 2,
        minRatioFollowers: 0.06,
        minFollowers: 8,
        minActivityPerWeek: 13,
        limit: 12,
        mustHavePP: true,
        accountCreatedAfter: new Date(2018, 1, 1),
        individualOnly: true,
    },
    maxBatchPerDay: 8,
    cooldownBetweenBatches: 7_200 * 1000, //2h00
    minLeechCount: 7,
    
    minFollowersCount: 300,
    dailyFollowingLimit: 70
}

export const STRATEGY_LV3: IFollowMassStrategy = {
    settings: {
        maxRatioFollowers: 3,
        minRatioFollowers: 0.1,
        minFollowers: 12,
        minActivityPerWeek: 11,
        limit: 12,
        mustHavePP: true,
        accountCreatedAfter: new Date(2017, 1, 1),
        mustHaveDescription: true,
        
    },
    maxBatchPerDay: 9,
    cooldownBetweenBatches: 7_200 * 1000 , //2h
    minLeechCount: 9,

    minFollowersCount: 500,
    dailyFollowingLimit: 74
}

export const STRATEGY_LV4: IFollowMassStrategy = {
    settings: {
        maxRatioFollowers: 5,
        minRatioFollowers: 0.15,
        minFollowers: 20,
        minActivityPerWeek: 10,
        limit: 12,
        mustHavePP: true,
        mustHaveDescription: true,
        accountCreatedAfter: new Date(2016, 1, 1),
    },
    maxBatchPerDay: 10,
    cooldownBetweenBatches: 7_200 * 1000, //2h 
    minLeechCount: 11,

    minFollowersCount: 1_000,
    dailyFollowingLimit: 78
}

export const getStrategy = (strategy: TFollowMassStrategy): IFollowMassStrategy => {
    if (strategy === 'lv2')
        return STRATEGY_LV2
    if (strategy === 'lv3')
        return STRATEGY_LV3
    if (strategy === 'lv4')
        return STRATEGY_LV4
    return STRATEGY_LV1
}

export const getMatchingStrategyLv = (followers_count: number): TFollowMassStrategy => {
    if (followers_count >= STRATEGY_LV4.minFollowersCount)
        return 'lv4'
    if (followers_count >= STRATEGY_LV3.minFollowersCount)
        return 'lv3'
    if (followers_count >= STRATEGY_LV2.minFollowersCount)
        return 'lv2'
    return 'lv1'
}
