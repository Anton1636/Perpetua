import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
	Deposit,
	Withdraw,
	Harvested,
} from '../generated/DividendVault/DividendVault'
import { Vault, Position, Transaction, HarvestEvent } from '../generated/schema'

const VAULT_ID = '0x8f9d8c1aa4e65c5d45755e2e00f5d3793d0c3241'

// Load-or-create the Vault row. Metadata (symbol, fee) isn't in these events,
// so it's filled in with sensible defaults here and can be refined by adding a
// call handler later — kept simple for the demo scope.
function loadVault(timestamp: BigInt, block: BigInt): Vault {
	let vault = Vault.load(VAULT_ID)
	if (vault == null) {
		vault = new Vault(VAULT_ID)
		vault.asset = Bytes.fromHexString(VAULT_ID)
		vault.symbol = 'pOx'
		vault.totalAssets = BigInt.zero()
		vault.totalShares = BigInt.zero()
		vault.performanceFeeBps = BigInt.zero()
		vault.createdAtBlock = block
		vault.createdAtTimestamp = timestamp
	}
	return vault
}

function loadPosition(user: Bytes, timestamp: BigInt): Position {
	const id = user.toHexString() + '-' + VAULT_ID
	let position = Position.load(id)
	if (position == null) {
		position = new Position(id)
		position.user = user
		position.vault = VAULT_ID
		position.shares = BigInt.zero()
		position.totalDeposited = BigInt.zero()
		position.totalWithdrawn = BigInt.zero()
	}
	position.updatedAtTimestamp = timestamp
	return position
}

export function handleDeposit(event: Deposit): void {
	const vault = loadVault(event.block.timestamp, event.block.number)
	vault.totalShares = vault.totalShares.plus(event.params.shares)
	vault.totalAssets = vault.totalAssets.plus(event.params.assets)
	vault.save()

	const position = loadPosition(event.params.owner, event.block.timestamp)
	position.shares = position.shares.plus(event.params.shares)
	position.totalDeposited = position.totalDeposited.plus(event.params.assets)
	position.save()

	const tx = new Transaction(
		event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
	)
	tx.kind = 'STAKE'
	tx.vault = VAULT_ID
	tx.user = event.params.owner
	tx.amount = event.params.assets
	tx.shares = event.params.shares
	tx.hash = event.transaction.hash
	tx.timestamp = event.block.timestamp
	tx.blockNumber = event.block.number
	tx.save()
}

export function handleWithdraw(event: Withdraw): void {
	const vault = loadVault(event.block.timestamp, event.block.number)
	vault.totalShares = vault.totalShares.minus(event.params.shares)
	vault.totalAssets = vault.totalAssets.minus(event.params.assets)
	vault.save()

	const position = loadPosition(event.params.owner, event.block.timestamp)
	position.shares = position.shares.minus(event.params.shares)
	position.totalWithdrawn = position.totalWithdrawn.plus(event.params.assets)
	position.save()

	const tx = new Transaction(
		event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
	)
	tx.kind = 'UNSTAKE'
	tx.vault = VAULT_ID
	tx.user = event.params.owner
	tx.amount = event.params.assets
	tx.shares = event.params.shares
	tx.hash = event.transaction.hash
	tx.timestamp = event.block.timestamp
	tx.blockNumber = event.block.number
	tx.save()
}

export function handleHarvested(event: Harvested): void {
	const vault = loadVault(event.block.timestamp, event.block.number)
	vault.save()

	const harvest = new HarvestEvent(
		event.transaction.hash.toHexString() + '-' + event.logIndex.toString(),
	)
	harvest.vault = VAULT_ID
	harvest.grossYield = event.params.grossYield
	harvest.fee = event.params.fee
	harvest.netStreamed = event.params.netStreamed
	harvest.timestamp = event.block.timestamp
	harvest.blockNumber = event.block.number
	harvest.save()

	const tx = new Transaction(
		event.transaction.hash.toHexString() +
			'-' +
			event.logIndex.toString() +
			'-h',
	)
	tx.kind = 'HARVEST'
	tx.vault = VAULT_ID
	tx.user = event.transaction.from
	tx.amount = event.params.netStreamed
	tx.hash = event.transaction.hash
	tx.timestamp = event.block.timestamp
	tx.blockNumber = event.block.number
	tx.save()
}
