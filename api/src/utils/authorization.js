const validateLeader = (leader_id, user_id) => {
  return leader_id.toString() === user_id.toString();
};

module.exports = {
  validateLeader,
};
