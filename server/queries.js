/* eslint-disable no-multi-str */

const getAllUsers = "SELECT users.* FROM users";

const allTransactions =
  "SELECT id, user_id, description, amount, transaction_date  FROM transactions WHERE user_id = $1 ORDER BY transactions.transaction_date DESC";

const getSingleTransactionWithTags =
  "SELECT ROW_TO_JSon(whole_transaction) AS full_transaction \
  FROM (SELECT description, amount, transaction_date, (SELECT JSon_AGG(tgs) FROM (SELECT * FROM tags_transactions  JOIN tags \
  ON tags_transactions.tag_id = tags.id \
    where tags_transactions.transaction_id = $1 \
    ) tgs \
  ) AS tags \
FROM transactions WHERE transactions.id = $1) whole_transaction";

//do another subquery within query starting on line 8 to grab all tags associated with a transaction
//something like ...FROM transactions JOIN (SELECT JSon_AGG(row_to_json(table_alias)))

// this won't return an id when the on ConFLICT clause fires, instead will get null?
const insertOrDoNothingTag =
  "INSERT INTO tags (tag_name) VALUES ($1) \
on ConFLICT (tag_name) DO NOTHING \
RETURNING id";

// create the association between a transaction and a single tag - would call this multiple times for every added for a transaction
// insert the transaction_id as first query param, and tag_id as second query param
const insertTagOnTransaction =
  "INSERT INTO tags_transactions (transaction_id, tag_id)\
  VALUES ($1, $2)";

const getUserIdTransactions = //WIP to query single user, all their transactions, and all tags for all their transactions
  "SELECT t.* FROM \
    (SELECT id, name, email, \
    (SELECT JSon_AGG(row_to_json(transactions)) \
      FROM transactions \
        WHERE user_id = users.id) AS user_transactions \
        FROM users \
          WHERE id = $1\
    ) t";

// flaw here is that if a transaction does not have tags associated with it in the JOIN table, this query will not find that
// transaction
const followUpUserId =
  "SELECT transactions.*, JSon_AGG(tags.*) as tags \
   FROM \
    transactions \
    JOIN \
    tags_transactions \
    on \
    transactions.id = tags_transactions.transaction_id \
    JOIN \
    tags \
    on \
    tags_transactions.tag_id = tags.id \
    WHERE transactions.user_id = $1 \
    GROUP BY transactions.id \
    ORDER BY transactions.transaction_date DESC";

//do I just want to grab tags for specific transactionId, or grab the specific transaction along with all associated tags, and just pass down transaction info down FROM front end -- my answer is grab the user and all (or some) transactions with transactions JOINed to tags

const postNewUser =
  "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *";

const postNewUserTransaction =
  "INSERT INTO transactions (description, amount, user_id) VALUES ($1, $2, $3) RETURNING *";

const postNewTags = "";

const postNewTransactionsTags = "";

// SELECT users.*, JSon_AGG(f) FROM (SELECT row_to_json(t) AS transactions FROM
// (SELECT * FROM transactions where user_id = users.id) t) f
// JOIN users
// on users.id = transactions.id
// where users.id = 1;

const postTagsOnTransaction =
  "SELECT t.* AS user FROM \
  (SELECT id, name, email, \
  (SELECT JSon_AGG(row_to_json(row(g))) \
    FROM transactions \
      WHERE user_id = users.id) AS user_transactions \
      FROM users \
        WHERE id = 1\
  ) t";

// this query SELECTs a single transaction with id = 2, as well as all the tag_ids associated with that transaction FROM the tags_transactions table

// -- JOIN transactons to tags_transactions
// -- JOIN resulting table of "transactions to tags_transactions"
// -- to tags

const kindOfWorks =
  "SELECT transactions.*, tags_transactions.* FROM \
transactions JOIN tags_transactions \
on transactions.id = tags_transactions.transaction_id \
where transactions.id = 2";

const alsoWorksSortOf =
  "SELECT JSon_AGG(t) FROM (SELECT transactions.*, \
tags.* \
FROM transactions \
JOIN tags_transactions \
on transactions.id = tags_transactions.transaction_id \
JOIN tags on tags.id = tags_transactions.tag_id \
where transactions.id = 2) t";

const deleteFromTagsTransactions =
  "DELETE FROM tags_transactions WHERE tags_transactions.transaction_id = $1";

const deleteTransaction = "DELETE FROM transactions WHERE transactions.id = $1";

module.exports = {
  getAllUsers,
  getUserIdTransactions,
  followUpUserId,
  postNewUser,
  postNewUserTransaction, //not written
  postTagsOnTransaction, //not written,
  alsoWorksSortOf,
  postNewTags,
  postNewTransactionsTags,
  insertOrDoNothingTag,
  insertTagOnTransaction,
  kindOfWorks,
  deleteFromTagsTransactions,
  deleteTransaction,
  getSingleTransactionWithTags,
  allTransactions,
};
