echo "Disabling WakeUp server"
mongo push_notification_server --quiet --eval "db.operators.update( { _id: '$1-$2' }, { \$set: { offline: true } } )"
echo "Done !"
