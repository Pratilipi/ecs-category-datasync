var schema = {
// TODO: REMOVE TAG_IDS AND SUGGESTED_TAGS from schema before moving to prod
  "structure": {

    "PRATILIPI_ID": {"type": "INTEGER", "default": null},
    // "AUTHOR_ID": {"type": "INTEGER", "default": null},
    // "CHAPTER_COUNT": {"type": "INTEGER", "default": null},
    // "CONTENT_TYPE": {"type": "STRING", "default": "PRATILIPI"},
    // "COVER_IMAGE": {"type": "STRING", "default": null},
    // "FB_LIKE_SHARE_COUNT": {"type": "INTEGER", "default": 0},
    // "FB_LIKE_SHARE_COUNT_OFFSET": {"type": "INTEGER", "default": 0},
    // "IMAGE_COUNT":  {"type": "INTEGER", "default": 0},
    // "INDEX": {"type": "STRING", "default": null},
    "LANGUAGE": {"type": "STRING", "default": null},
    "LAST_UPDATED": {"type": "TIMESTAMP", "default": "new Date()"},
    // "LISTING_DATE": {"type": "TIMESTAMP", "default": "new Date()"},
    // "OLD_CONTENT": {"type": "BOOLEAN", "default": false},
    // "PAGE_COUNT": {"type": "INTEGER", "default": 0},
    "PRATILIPI_TYPE": {"type": "STRING", "default": null},
    // "PUBLIC_DOMAIN": {"type": "BOOLEAN", "default": null},
    // "PUBLISHER_ID": {"type": "INTEGER", "default": null},
    // "RATING_COUNT": {"type": "INTEGER", "default": 0},
    // "READ_COUNT": {"type": "INTEGER", "default": 0},
    // "READ_COUNT_OFFSET": {"type": "INTEGER", "default": 0},
    // "REVIEW_COUNT": {"type": "INTEGER", "default": 0},
    "STATE": {"type": "STRING", "default": "DRAFTED"},
    "SUGGESTED_TAGS": {"type": "ARRAY", "default": null},
    // "SUMMARY": {"type": "STRING", "default": null},
    "TAG_IDS": {"type": "ARRAY", "default": null},
    // "TITLE": {"type": "STRING", "default": null},
    // "TITLE_EN": {"type": "STRING", "default": null},
    // "TOTAL_RATING": {"type": "INTEGER", "default": 0},
    // "WORD_COUNT": {"type": "INTEGER", "default": 0},
    "_TIMESTAMP_": {"type": "TIMESTAMP", "default": "new Date()"}

  },
  "primaryKey": "PRATILIPI_ID",
  "excludeFromIndexes": [ "TITLE", "TITLE_EN", "SUMMARY", "INDEX", "OLD_CONTENT", "SUGGESTED_TAGS" ]
};

module.exports = schema;
